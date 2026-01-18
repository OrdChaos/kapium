#ifndef POST_DATA_H
#define POST_DATA_H

#include <string>
#include "../lib/nlohmann/json.hpp"

namespace post_data {
    class POST_DATA {
    public:
        std::string markdown;
        std::string plain_text;
        std::string abbrlink;
        std::string summary;
        nlohmann::json post_json;

        POST_DATA(std::string md, std::string abbr, std::string summary, std::string plain, nlohmann::json meta);
    };
}

#endif // POST_DATA_H