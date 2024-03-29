#include "wall.hpp"

using namespace eosio;
using namespace std;

class wall : public contract
{
  using contract::contract;

public:
  const uint64_t width = 1000;
  const uint64_t height = 1000;
  const uint64_t minOrderPixels = 10;
  const uint64_t maxOrderPixels = 100;

  struct [[eosio::table]] Global
  {
    uint64_t id;
    uint64_t pixelsSold;
    uint64_t primary_key() const { return id; }
    EOSLIB_SERIALIZE(Global, (id)(pixelsSold));
  };
  typedef multi_index<N(global), Global> globalIndex;

  struct [[eosio::table]] Account
  {
    account_name account;
    asset balance;
    uint64_t primary_key() const { return account; }
    EOSLIB_SERIALIZE(Account, (account)(balance));
  };
  typedef multi_index<N(account), Account> accountIndex;

  struct [[eosio::table]] Slot
  {
    uint64_t id;
    uint64_t x1;
    uint64_t y1;
    uint64_t x2;
    uint64_t y2;
    string title;
    string image;
    string url;
    asset price;
    uint64_t time;
    account_name owner;
    uint64_t primary_key() const { return id; }
    EOSLIB_SERIALIZE(Slot, (id)(x1)(y1)(x2)(y2)(title)(image)(url)(price)(time)(owner));
  };
  typedef multi_index<N(slot), Slot> slotIndex;

  [[eosio::action]] void buy(
      uint64_t x1, uint64_t y1,
      uint64_t x2, uint64_t y2,
      string title, string image, string url, account_name buyer) {
    require_auth(buyer);
    coordinate c1 = {x1, y1};
    coordinate c2 = {x2, y2};
    eosio_assert(is_account(buyer), "The buyer account is not valid.");
    eosio_assert(areCoordinatesValid(c1, c2), "The slot is not valid.");
    eosio_assert(isSlotDataValid(title, image, url), "The slot data is invalid. Check: Title[0-60] - Image[0-300] - Url[0-300]");
    auto slotPrice = calculatePrice(c1, c2);
    debit(buyer, slotPrice);
    slotIndex slots(_self, _self);
    auto slot = slots.emplace(buyer, [&](auto &slot) {
      slot.id = slots.available_primary_key();
      slot.x1 = x1;
      slot.y1 = y1;
      slot.x2 = x2;
      slot.y2 = y2;
      slot.title = title;
      slot.image = image;
      slot.url = url;
      slot.price = slotPrice;
      slot.time = now();
      slot.owner = buyer;
    });
    globalIndex global(_self, _self);
    auto globalItr = global.find(0);
    global.modify(globalItr, _self, [&](auto &global) {
      global.pixelsSold += getTotalPixels(c1, c2);
    });
  }

      [[eosio::action]] void update(uint64_t id, string title, string image, string url, account_name owner)
  {
    eosio_assert(isSlotDataValid(title, image, url), "The slot data is invalid. Check: Title[0-60] - Image[0-300] - Url[0-300]");
    eosio_assert(is_account(owner), "The new owner account is not valid.");
    slotIndex slots(_self, _self);
    auto slotItr = slots.find(id);
    eosio_assert(slotItr != slots.end(), "The slot does not exist.");
    auto slot = slots.get(id);
    eosio_assert(has_auth(slot.owner) || has_auth(_self), "Invalid authorization");
    slots.modify(slotItr, _self, [&](auto &slot) {
      slot.title = title;
      slot.image = image;
      slot.url = url;
      slot.owner = owner;
    });
  }

  [[eosio::action]] void erase(uint64_t id) {
    require_auth(_self);
    slotIndex slots(_self, _self);
    auto slot = slots.get(id);
    coordinate c1 = {slot.x1, slot.y1};
    coordinate c2 = {slot.x2, slot.y2};
    uint64_t slotTotalPixels = getTotalPixels(c1, c2);
    globalIndex global(_self, _self);
    auto globalItr = global.find(0);
    global.modify(globalItr, _self, [&](auto &global) {
      global.pixelsSold -= slotTotalPixels;
    });
    auto slotItr = slots.find(id);
    eosio_assert(slotItr != slots.end(), "The slot does not exist.");
    slots.erase(slotItr);
    eosio_assert(slotItr != slots.end(), "The slot was not erased propertly.");
  }

  [[eosio::action]] void setglobal(uint64_t pixelsSold)
  {
    require_auth(_self);
    globalIndex global(_self, _self);
    auto globalItr = global.find(0);
    if (globalItr != global.end())
    {
      global.modify(globalItr, _self, [&](auto &global) {
        global.pixelsSold = pixelsSold;
      });
    }
    else
    {
      global.emplace(_self, [&](auto &global) {
        global.id = 0;
        global.pixelsSold = pixelsSold;
      });
    }
  }

  [[eosio::action]] void refund(account_name to) {
    require_auth(_self);
    accountIndex accounts(_self, to);
    auto account = accounts.get(to);
    debit(account.account, account.balance);
    action(
        permission_level{_self, N(active)},
        N(eosio.token), N(transfer),
        make_tuple(_self, account.account, account.balance, std::string("The EOS Wall - Refund")))
        .send();
  }

      [[eosio::action]] void broadcast(account_name account, string message)
  {
    require_auth(_self);
    require_recipient(account);
  }

  /*Auxiliary contract methods*/

  void onTransfer(account_name from, account_name to, eosio::asset quantity, std::string memo)
  {
    if (from == _self || to != _self)
    {
      return;
    }
    eosio_assert(quantity.symbol == string_to_symbol(4, "EOS"), "Only EOS is accepted.");
    eosio_assert(quantity.is_valid(), "Invalid token transfer.");
    eosio_assert(quantity.amount > 0, "Quantity must be positive.");
    deposit(from, quantity);
  }

  void debit(account_name from, asset quantity)
  {
    accountIndex accounts(_self, from);
    auto accountItr = accounts.find(from);
    eosio_assert(accountItr != accounts.end(), "Debit: Account was not found.");
    auto account = accounts.get(from);
    eosio_assert(account.balance >= quantity, "Debit: Insufficient balance");
    accounts.modify(accountItr, _self, [&](auto &account) {
      account.balance -= quantity;
    });
  }
  void deposit(account_name to, asset quantity)
  {
    accountIndex accounts(_self, to);
    auto accountItr = accounts.find(to);
    if (accountItr != accounts.end())
    {
      accounts.modify(accountItr, _self, [&](auto &account) {
        account.balance += quantity;
      });
    }
    else
    {
      accounts.emplace(_self, [&](auto &account) {
        account.account = to;
        account.balance = quantity;
      });
    }
  }

  uint64_t getWidth(coordinate c1, coordinate c2)
  {
    return c2[0] - c1[0];
  }

  uint64_t getHeight(coordinate c1, coordinate c2)
  {
    return c2[1] - c1[1];
  }

  uint64_t getTotalPixels(coordinate c1, coordinate c2)
  {
    return getWidth(c1, c2) * getHeight(c1, c2);
  }

  asset calculatePrice(coordinate c1, coordinate c2)
  {
    globalIndex global(_self, _self);
    auto stats = global.get(0);
    uint64_t pixelsSold = stats.pixelsSold;
    float slope = (pixelsSold <= 800000) ? (0.0015 / (width * height)) : (0.003 / (width * height));
    float pixelPrice = slope * pixelsSold + 0.0005;
    float value = (pixelPrice * getTotalPixels(c1, c2)) * 10000;
    asset price = asset(value, S(4, EOS));
    return price;
  }

  bool areCoordinatesValid(coordinate c1, coordinate c2)
  {
    // is c2 > c1 ?
    bool condition1 = (c2[0] > c1[0] && c2[1] > c1[1]);
    // is inside wall ?
    bool condition2 = (c1[0] <= width && c1[1] <= height && c2[0] <= width && c2[1] <= height);
    // has correct size ?
    bool condition3 = getTotalPixels(c1, c2) >= (minOrderPixels * minOrderPixels) && getTotalPixels(c1, c2) <= (maxOrderPixels * maxOrderPixels);
    // is divisible by 10 ?
    bool condition4 = (c1[0] % minOrderPixels == 0 && c1[1] % minOrderPixels == 0 && c2[0] % minOrderPixels == 0 && c2[1] % minOrderPixels == 0);
    bool valid = (condition1 && condition2 && condition3 && condition4);
    return valid;
  }

  bool isSlotDataValid(string title, string image, string url)
  {
    bool valid = (title.length() <= 60 && image.length() <= 300 & url.length() <= 300);
    return valid;
  }

  // Catches any action apply
  void apply(account_name contract, action_name act)
  {
    if ( (contract == N(eosio.token) && act == N(transfer)) || (contract == N(cryptopesosc) && act == N(transfer)) )
    {
      struct transfer_t
      {
        account_name from;
        account_name to;
        eosio::asset quantity;
        std::string memo;
      } t = eosio::unpack_action_data<transfer_t>();
      asset quantity;
      if(contract == N(eosio.token)) {
        quantity = t.quantity;
      }else if(contract == N(cryptopesosc)){
        quantity = asset(t.quantity.amount / 2000, S(4, EOS));
      }
      onTransfer(t.from, t.to, quantity, t.memo);
      return;
    }
    if (contract != _self)
      return;
    // needed for EOSIO_API macro
    auto &thiscontract = *this;
    switch (act)
    {
      // first argument is name of CPP class, not contract
      EOSIO_API(wall, (buy)(update)(erase)(setglobal)(refund)(broadcast))
    };
  }
};

extern "C"
{
  void apply(uint64_t receiver, uint64_t code, uint64_t action)
  {
    auto self = receiver;
    wall w(receiver);
    w.apply(code, action);
    eosio_exit(0);
  }
}\
