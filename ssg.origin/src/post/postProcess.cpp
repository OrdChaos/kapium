#include "../../include/classPOST.hpp"
#include "../../include/md4cCallback.hpp"
#include "../../include/postInfoCaculate.hpp"

auto POST::format_post() -> void {
    FORMATED_POST post = md_to_html(markdown);
    post_json["content"] = post.html;
    post_json["toc"] = post.toc;
}

auto POST::generate_excerpt() -> void {
    size_t more_pos = markdown.find("<!-- more -->");
    if (more_pos == std::string::npos)
        more_pos = markdown.find("<!--more-->");

    if (!post_json.contains("excerpt")) {
        if (more_pos != std::string::npos) {
            post_json["excerpt"] =
                md_to_plaintext(markdown.substr(0, more_pos));
        } else {
            std::string cut = truncate_by_units(plain_text, 25.0);
            if (cut.size() < plain_text.size())
                cut += "...";
            post_json["excerpt"] = cut;
        }
    }
}

auto POST::generate_read_time() -> void {
    post_json["readTime"] =
        std::to_string(calc_read_time(plain_text));
}

auto POST::generate_abbrlink_and_summary() -> void {
    post_json["abbrlink"] = abbrlink;
    post_json["summary"] = summary;
}

auto POST::serialize_post() -> nlohmann::json {
    return post_json;
}