#ifndef _POST_INFO_CACULATE_HPP_
#define _POST_INFO_CACULATE_HPP_ 

#include <string>
#include <cmath>

#include "config.hpp"

auto calc_read_time(const std::string& text) -> int;
auto truncate_by_units(const std::string& text, double max_units) -> std::string;

#endif // _POST_INFO_CACULATE_HPP_