#ifndef MD_PARSER_CALLBACK_H
#define MD_PARSER_CALLBACK_H

#include <string>
#include "../lib/nlohmann/json.hpp"
#include "../lib/md4c/md4c.h"
#include "../lib/md4c/md4c-html.h"

namespace md_parser_callback {
    struct FORMATTED_POST {
        std::string html;
        nlohmann::json toc;

        FORMATTED_POST(std::string html, nlohmann::json toc) : html(std::move(html)), toc(std::move(toc)) {}
    };

    auto md_to_html(const std::string& markdown) -> FORMATTED_POST;
    auto md_to_plaintext(const std::string& markdown) -> std::string;
}

#endif // MD_PARSER_CALLBACK_H