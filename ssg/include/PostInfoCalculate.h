#ifndef POST_INFO_CALCULATE_H
#define POST_INFO_CALCULATE_H

#include <string>
#include <cmath>

#include "Config.h"

namespace post_info_calculate {
    auto calc_read_time(const std::string& text) -> int;
    auto truncate_by_units(const std::string& text, double max_units) -> std::string;
}

#endif // POST_INFO_CALCULATE_H