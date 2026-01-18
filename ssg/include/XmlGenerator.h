#ifndef XML_GENERATOR_H
#define XML_GENERATOR_H

#include <string>
#include <vector>
#include "../lib/nlohmann/json.hpp"
#include "../lib/tinyxml2/tinyxml2.h"

namespace xml_generator {
    auto generate_rss(const std::vector<nlohmann::json>& posts) -> std::string;
    auto generate_sitemap(const std::vector<nlohmann::json>& posts, const nlohmann::json& categories, const nlohmann::json& tags) -> std::string;
}

#endif // XML_GENERATOR_H