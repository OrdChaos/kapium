#ifndef _MD4C_CALLBACK_HPP_
#define _MD4C_CALLBACK_HPP_

#include <string>

#include "../lib/md4c/md4c.h"
#include "../lib/md4c/md4c-html.h"
#include "../lib/nlohmann/json.hpp"

struct FORMATED_POST {
    std::string html;
    nlohmann::json toc;

    FORMATED_POST(std::string html, nlohmann::json toc) : html(std::move(html)), toc(std::move(toc)) {}
};

auto md_to_html(const std::string& markdown) -> FORMATED_POST;
auto md_to_plaintext(const std::string& markdown) -> std::string;

#endif // _MD4C_CALLBACK_HPP_