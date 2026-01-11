#include "../../include/postInfoCaculate.hpp"

auto calc_read_time(const std::string& text) -> int {
    double units = 0.0;
    for (unsigned char c : text) {
        if (std::isspace(c)) continue;
        units += (c <= 0x7F) ? 0.5 : 1.0;
    }
    int min = (int)std::ceil(units / READ_TIME_UNITS_PER_MIN);
    return min < 1 ? 1 : min;
}

auto truncate_by_units(
    const std::string& text,
    double max_units
) -> std::string {
    double units = 0.0;
    size_t i = 0;

    while (i < text.size()) {
        unsigned char c = text[i];
        size_t len = 1;

        if ((c & 0x80) == 0x00) len = 1;
        else if ((c & 0xE0) == 0xC0) len = 2;
        else if ((c & 0xF0) == 0xE0) len = 3;
        else if ((c & 0xF8) == 0xF0) len = 4;

        double w = (c <= 0x7F) ? 0.5 : 1.0;
        if (units + w > max_units) break;

        units += w;
        i += len;
    }
    return text.substr(0, i);
}