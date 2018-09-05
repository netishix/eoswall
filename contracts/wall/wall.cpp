#include <wall/wall.hpp>

using namespace eosio;
using namespace std;

class wall : public contract
{
  using contract::contract;

public:
  const uint64_t width = 1000;
  const uint64_t height = 1000;
  const uint64_t minOrderPixels = 10;
  const float pixelPrice = 0.01;

  /// @abi table account
  struct Account
  {
    account_name account;
    asset balance;
    uint64_t primary_key() const { return account; }
    EOSLIB_SERIALIZE(Account, (account)(balance));
  };
  typedef multi_index<N(account), Account> accountIndex;

  /// @abi table slot
  struct Slot
  {
    uint64_t id;
    uint64_t x1;
    uint64_t y1;
    uint64_t x2;
    uint64_t y2;
    string title;
    string image;
    string url;
    account_name owner;
    uint64_t primary_key() const { return id; }
    EOSLIB_SERIALIZE(Slot, (id)(x1)(y1)(x2)(y2)(title)(image)(url)(owner));
  };
  typedef multi_index<N(slot), Slot> slotIndex;

  /// @abi action
  void buy(
      uint64_t x1, uint64_t y1,
      uint64_t x2, uint64_t y2,
      string title, string image, string url, account_name owner)
  {
    require_auth(owner);
    coordinate c1 = {x1, y1};
    coordinate c2 = {x2, y2};
    eosio_assert(areCoordinatesValid(c1, c2), "The slot is not valid.");
    eosio_assert(isSlotDataValid(title, image, url), "The slot data is invalid. Check: Title[0-60] - Image[0-300] - Url[0-300]");
    eosio_assert(!intersects(c1, c2), "The slot is not available because it itersects with another slot.");
    
    auto slotPrice = calculatePrice(c1,c2);
    accountIndex accounts(_self, owner);
    auto iterator = accounts.find(owner);
    eosio_assert(iterator != accounts.end(), "You do not have an account with balance. Please make a transfer before buying.");
    auto account = accounts.get(owner);
    eosio_assert(account.balance >= slotPrice, "Insufficient balance to buy this slot.");
    accounts.modify(iterator, owner, [&](auto &account) {
        account.balance -= slotPrice;
    });
    slotIndex slots(_self, _self);
    auto slot = slots.emplace(owner, [&](auto &slot) {
      slot.id = slots.available_primary_key();
      slot.x1 = x1;
      slot.y1 = y1;
      slot.x2 = x2;
      slot.y2 = y2;
      slot.title = title;
      slot.image = image;
      slot.url = url;
      slot.owner = owner;
    });
  }

  /// @abi action
  void update(uint64_t id, string title, string image, string url)
  {
    eosio_assert(isSlotDataValid(title, image, url), "The slot data is invalid. Check: Title[0-60] - Image[0-300] - Url[0-300]");
    slotIndex slots(_self, _self);
    auto iterator = slots.find(id);
    eosio_assert(iterator != slots.end(), "The slot does not exist.");
    auto slot = slots.get(id);
    require_auth(slot.owner);
    slots.modify(iterator, _self, [&](auto &slot) {
      slot.title = title;
      slot.image = image;
      slot.url = url;
    });
  }

  /// @abi action
  void erase(uint64_t id)
  {
    account_name admin = current_receiver();
    require_auth(admin);
    slotIndex slots(_self, _self);
    auto iterator = slots.find(id); //replace with primary key
    eosio_assert(iterator != slots.end(), "The slot does not exist.");
    slots.erase(iterator);
    eosio_assert(iterator != slots.end(), "The slot was not erased properly.");
  }

  /// @abi action
  void transfer(uint64_t sender, uint64_t receiver)
  {
    auto transferData = unpack_action_data<currency::transfer>();
    if(transferData.from == _self || transferData.to != _self){
      return;
    }
    eosio_assert(transferData.quantity.symbol == string_to_symbol(4, "EOS"), "Only EOS is accepted.");
    eosio_assert(transferData.quantity.is_valid(), "Invalid token transfer.");
    eosio_assert(transferData.quantity.amount > 0, "Quantity must be positive.");
    accountIndex accounts(_self, transferData.from);
    auto iterator = accounts.find(transferData.from);
    if (iterator != accounts.end())
    {
      accounts.modify(iterator, _self, [&](auto &account) {
        account.balance += transferData.quantity;
      });
    }
    else
    {
      accounts.emplace(_self, [&](auto &account) {
        account.account = transferData.from;
        account.balance = transferData.quantity;
      });
    }
  }

private:
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
    uint64_t value = (pixelPrice * getTotalPixels(c1, c2)) * 10000;
    asset price = asset(value, S(4,EOS));
    return price;
  }

  bool intersects(coordinate c1, coordinate c2)
  {
    slotIndex slots(_self, _self);
    for (auto &slot : slots)
    {
      if (c1[0] < slot.x2 && c2[0] > slot.x1 && c1[1] < slot.y2 && c2[1] > slot.y1)
      { return true; }
    }
    return false;
  }

  bool areCoordinatesValid(coordinate c1, coordinate c2)
  {
    // is c2 > c1 ?
    bool condition1 = (c2[0] > c1[0] && c2[1] > c1[1]);
    // is inside wall ?
    bool condition2 = (c1[0] <= width && c1[1] <= height && c2[0] <= width && c2[1] <= height);
    // has minimum dimensions ?
    bool condition3 = (getWidth(c1, c2) >= minOrderPixels && getHeight(c1, c2) >= minOrderPixels);
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

};

#undef EOSIO_ABI // redefine the macro under the official macro name in order to use eosiocpp abi generator tool
#define EOSIO_ABI(TYPE, MEMBERS)                                                                                         \
  extern "C"                                                                                                             \
  {                                                                                                                      \
    void apply(uint64_t receiver, uint64_t code, uint64_t action)                                                        \
    {                                                                                                                    \
      if (action == N(onerror))                                                                                          \
      {                                                                                                                  \
        /* onerror is only valid if it is for the "eosio" code account and authorized by "eosio"'s "active permission */ \
        eosio_assert(code == N(eosio), "onerror action's are only valid from the \"eosio\" system account");             \
      }                                                                                                                  \
      auto self = receiver;                                                                                              \
      if (code == self || code == N(eosio.token) || action == N(onerror))                                                \
      {                                                                                                                  \
        TYPE thiscontract(self);                                                                                         \
        switch (action)                                                                                                  \
        {                                                                                                                \
          EOSIO_API(TYPE, MEMBERS)                                                                                       \
        }                                                                                                                \
        /* does not allow destructor of thiscontract to run: eosio_exit(0); */                                           \
      }                                                                                                                  \
    }                                                                                                                    \
  }

EOSIO_ABI(wall, (buy)(update)(erase)(transfer));
