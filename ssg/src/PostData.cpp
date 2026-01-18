#include "../include/PostData.h"

namespace post_data {
    POST_DATA::POST_DATA(std::string md, std::string abbr, std::string summary, std::string plain, nlohmann::json meta)
        : markdown(std::move(md)),
          plain_text(std::move(plain)),
          abbrlink(std::move(abbr)),
          summary(std::move(summary)),
          post_json(std::move(meta)) {}
}