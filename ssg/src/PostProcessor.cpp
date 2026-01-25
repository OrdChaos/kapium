#include "../include/PostProcessor.h"
#include "../include/MdParserCallback.h"
#include "../include/PostInfoCalculate.h"

namespace post_processor {
    POST_PROCESSOR::POST_PROCESSOR(std::string markdown, std::string abbrlink, std::string summary, std::string plain_text, nlohmann::json meta)
        : post_data(std::move(markdown), std::move(abbrlink), std::move(summary), std::move(plain_text), std::move(meta)) {}

    void POST_PROCESSOR::format_post() {
        md_parser_callback::FORMATTED_POST post = md_parser_callback::md_to_html(post_data.markdown);
        post_data.post_json["content"] = post.html;
        post_data.post_json["toc"] = post.toc;
    }

    void POST_PROCESSOR::generate_excerpt() {
        size_t more_pos = post_data.markdown.find("<!-- more -->");
        if (more_pos == std::string::npos)
            more_pos = post_data.markdown.find("<!--more-->");

        if (!post_data.post_json.contains("excerpt")) {
            if (more_pos != std::string::npos) {
                post_data.post_json["excerpt"] =
                    md_parser_callback::md_to_plaintext(post_data.markdown.substr(0, more_pos));
            } else {
                std::string cut = post_info_calculate::truncate_by_units(post_data.plain_text, 25.0);
                post_data.post_json["excerpt"] = cut;
            }
        }
    }

    void POST_PROCESSOR::generate_read_time() {
        post_data.post_json["readTime"] =
            std::to_string(post_info_calculate::calc_read_time(post_data.plain_text));
    }

    void POST_PROCESSOR::generate_abbrlink_and_summary() {
        post_data.post_json["abbrlink"] = post_data.abbrlink;
        post_data.post_json["summary"] = post_data.summary;
    }

    nlohmann::json POST_PROCESSOR::serialize_post() {
        return post_data.post_json;
    }
}