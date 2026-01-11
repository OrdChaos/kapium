#ifndef _CLASS_POST_HPP_
#define _CLASS_POST_HPP_ 

#include <string>

#include "../lib/nlohmann/json.hpp"

class POST {
    std::string markdown;
    std::string plain_text;
    std::string abbrlink;
    nlohmann::json post_json;

    public:
    POST(std::string md, std::string abbr, std::string plain, nlohmann::json meta)
        : markdown(std::move(md)),
        plain_text(std::move(plain)),
        abbrlink(std::move(abbr)),
        post_json(std::move(meta)) {}
    
    auto format_post() -> void;
    auto generate_excerpt() -> void;
    auto generate_read_time() -> void;
    auto generate_abbrlink() -> void;
    auto serialize_post() -> nlohmann::json;
};

#endif // _CLASS_POST_HPP_