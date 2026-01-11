#ifndef _XML_HPP_
#define _XML_HPP_

#include <string>
#include <iomanip>

#include "config.hpp"

#include "../lib/nlohmann/json.hpp"
#include "../lib/tinyxml2/tinyxml2.h"

auto generate_rss(const std::vector<nlohmann::json>& posts) -> std::string;
auto generate_sitemap(const std::vector<nlohmann::json>& posts, const nlohmann::json& categories, const nlohmann::json& tags) -> std::string;

#endif // _XML_HPP_