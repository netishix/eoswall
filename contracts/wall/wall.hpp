/**
 *  @file
 *  @copyright defined in eos/LICENSE.txt
 */
#include <eosiolib/eosio.hpp>
#include <eosiolib/asset.hpp>

typedef uint64_t coordinate[2];

struct transfer_t
{
  account_name from;
  account_name to;
  eosio::asset quantity;
  std::string memo;
};