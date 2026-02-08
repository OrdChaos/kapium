#include <iostream>
#include <fstream>
#include <sstream>
#include <filesystem>
#include <vector>
#include <map>
#include <algorithm>
#include <cmath>
#include <cctype>
#include <string>

#include "../include/PostProcessor.h"
#include "../include/MdParserCallback.h"
#include "../include/PostInfoCalculate.h"
#include "../include/XmlGenerator.h"

#include "../lib/nlohmann/json.hpp"

auto main(int argc, char* argv[]) -> int {
    if(argc != 3) {
        std::cerr << "[SSG] Usage: ssg <input_markdown_file> <output_json_file>" << std::endl;
        return 1;
    }

    std::vector<nlohmann::json> all_posts;
    nlohmann::json categories_count = nlohmann::json::object();
    nlohmann::json tags_count = nlohmann::json::object();
    nlohmann::json category_posts = nlohmann::json::object();
    nlohmann::json tag_posts = nlohmann::json::object();
    nlohmann::json search_results = nlohmann::json::array();

    const std::filesystem::path md_input(argv[1]);
    const std::filesystem::path meta_output(argv[2]);

    try {
        if (!std::filesystem::exists(meta_output)) {
            if (
                std::filesystem::create_directories(meta_output / "posts") &&
                std::filesystem::create_directories(meta_output / "data") &&
                std::filesystem::create_directories(meta_output / "info")
            ) {
                std::cout << "[SSG] Created output directory: " << meta_output << std::endl;
            }
        }
    } catch (const std::filesystem::filesystem_error& e) {
        std::cerr << "[SSG] Critical Error: Could not create directory " << e.what() << std::endl;
        return 1;
    }

    for(const auto& entry : std::filesystem::directory_iterator(md_input)) {
        if (!entry.is_directory()) continue;

        std::filesystem::path md_path   = entry.path() / "post.md";
        std::filesystem::path meta_path = entry.path() / "meta.json";
        std::filesystem::path abbr_path = entry.path() / "abbrlink.txt";
        std::filesystem::path summary_path = entry.path() / "summary.txt";

        if (!std::filesystem::exists(md_path) ||
            !std::filesystem::exists(meta_path) ||
            !std::filesystem::exists(abbr_path) ||
            !std::filesystem::exists(summary_path)) {
            std::cerr << "[SSG] Skip invalid post: "
                      << entry.path() << "\n";
            continue;
        }

        std::ifstream md_ifs(md_path);
        std::ifstream meta_ifs(meta_path);
        std::ifstream abbr_ifs(abbr_path);
        std::ifstream summary_ifs(summary_path);

        std::stringstream ss;
        ss << md_ifs.rdbuf();
        std::string markdown = ss.str();

        nlohmann::json meta = nlohmann::json::parse(meta_ifs);

        std::string abbr;
        std::getline(abbr_ifs, abbr);

        std::string summary;
        std::getline(summary_ifs, summary);
        abbr.erase(std::remove_if(abbr.begin(), abbr.end(), [](unsigned char c) {
            return std::iscntrl(c); 
        }), abbr.end());

        summary.erase(std::remove_if(summary.begin(), summary.end(), [](unsigned char c) {
            return std::iscntrl(c); 
        }), summary.end());

        std::filesystem::path json_out =
            meta_output / "posts" / (abbr + ".json");

        std::string plain = md_parser_callback::md_to_plaintext(markdown);

        nlohmann::json composed_post_json;
        {
            post_processor::POST_PROCESSOR p(markdown, abbr, summary, plain, meta);
            p.format_post();
            p.generate_excerpt();
            p.generate_read_time();
            p.generate_abbrlink_and_summary();

            composed_post_json = p.serialize_post();
        }
        std::ofstream(json_out) << composed_post_json.dump(4);

        nlohmann::json idx {
            {"id", abbr},
            {"title", composed_post_json["title"]},
            {"excerpt", composed_post_json["excerpt"]},
            {"date", composed_post_json["date"]},
            {"readTime", composed_post_json["readTime"]},
            {"category", composed_post_json["category"]},
            {"tags", composed_post_json["tags"]}
        };

        all_posts.push_back(idx);

        std::string cat = composed_post_json["category"];
        if (!categories_count.contains(cat))
            categories_count[cat] = 0;
        categories_count[cat] =
            categories_count[cat].get<int>() + 1;
        category_posts[cat].push_back(idx);

        for (const auto& t : composed_post_json["tags"]) {
            std::string tag = t.get<std::string>();
            if (!tags_count.contains(tag))
                tags_count[tag] = 0;
            tags_count[tag] =
                tags_count[tag].get<int>() + 1;
            tag_posts[tag].push_back(idx);
        }

        search_results.push_back({
            {"id", abbr},
            {"title", composed_post_json["title"]},
            {"excerpt", composed_post_json["excerpt"]},
            {"category", composed_post_json["category"]}
        });

        std::cout << "[SSG] Processed: " << abbr << std::endl;
    }

    std::sort(all_posts.begin(), all_posts.end(),
        [](const nlohmann::json& a, const nlohmann::json& b) {
            return a["date"] > b["date"];
        });

    std::ofstream(meta_output / "data" / "posts.json")
        << nlohmann::json(all_posts).dump(4);

    nlohmann::json post_navigation = nlohmann::json::object();
    for (size_t i = 0; i < all_posts.size(); ++i) {
        const auto& curr = all_posts[i];
        const std::string curr_id = curr["id"].get<std::string>();

        nlohmann::json entry;

        if (i + 1 < all_posts.size()) {
            const auto& prev_post = all_posts[i + 1];
            entry["prev"] = {
                {"id",    prev_post["id"]},
                {"title", prev_post["title"]}
            };
        } else {
            entry["prev"] = nullptr;
        }

        if (i > 0) {
            const auto& next_post = all_posts[i - 1];
            entry["next"] = {
                {"id",    next_post["id"]},
                {"title", next_post["title"]}
            };
        } else {
            entry["next"] = nullptr;
        }

        post_navigation[curr_id] = entry;
    }

    nlohmann::json categories = nlohmann::json::array();
    for (auto& [k, v] : categories_count.items()) {
        categories.push_back({{"name", k}, {"count", v}});
    }

    std::sort(categories.begin(), categories.end(), 
        [](const nlohmann::json& a, const nlohmann::json& b) {
            return a["count"].get<int>() > b["count"].get<int>();
        });

    nlohmann::json tags = nlohmann::json::array();
    for (auto& [k, v] : tags_count.items())
        tags.push_back({{"name", k}, {"count", v}});


    std::ofstream(meta_output / "data" / "postNavigation.json") << post_navigation.dump(4);
    std::ofstream(meta_output / "data" / "categories.json") << categories.dump(4);
    std::ofstream(meta_output / "data" / "tags.json") << tags.dump(4);
    std::ofstream(meta_output / "data" / "categoryPosts.json") << category_posts.dump(4);
    std::ofstream(meta_output / "data" / "tagPosts.json") << tag_posts.dump(4);
    std::ofstream(meta_output / "data" / "searchResults.json") << search_results.dump(4);

    std::string rss_content = xml_generator::generate_rss(all_posts);
    std::string sitemap_content = xml_generator::generate_sitemap(all_posts, categories, tags);
    std::ofstream(meta_output / "info" / "rss.xml") << rss_content;
    std::ofstream(meta_output / "info" / "sitemap.xml") << sitemap_content;

    return 0;
}