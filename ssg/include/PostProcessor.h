#ifndef POST_PROCESSOR_H
#define POST_PROCESSOR_H

#include <string>
#include "../lib/nlohmann/json.hpp"
#include "PostData.h"

namespace post_processor {
    class POST_PROCESSOR {
    private:
        post_data::POST_DATA post_data;

    public:
        POST_PROCESSOR(std::string markdown, std::string abbrlink, std::string summary, std::string plain_text, nlohmann::json meta);
        void format_post();
        void generate_excerpt();
        void generate_read_time();
        void generate_abbrlink_and_summary();
        nlohmann::json serialize_post();
    };
}

#endif // POST_PROCESSOR_H