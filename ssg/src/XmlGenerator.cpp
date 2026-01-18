#include "../include/XmlGenerator.h"
#include "../include/Config.h"
#include <iomanip>
#include <sstream>

namespace xml_generator {
    auto format_date(const std::string& date_str, const std::string& format) -> std::string {
        std::tm tm = {};
        std::istringstream ss(date_str);
        
        ss >> std::get_time(&tm, "%Y-%m-%d %H:%M:%S");
        
        if (ss.fail()) {
            ss.clear();
            ss.str(date_str);
            ss >> std::get_time(&tm, "%Y-%m-%d");
            if (ss.fail()) return date_str; 
        }

        std::ostringstream out;
        out << std::put_time(&tm, format.c_str());
        return out.str();
    }

    auto generate_rss(const std::vector<nlohmann::json>& posts) -> std::string {
        tinyxml2::XMLDocument doc;

        doc.InsertEndChild(doc.NewDeclaration());

        tinyxml2::XMLElement* rss = doc.NewElement("rss");
        rss->SetAttribute("version", "2.0");
        doc.InsertEndChild(rss);

        tinyxml2::XMLElement* channel = doc.NewElement("channel");
        rss->InsertEndChild(channel);

        auto add_node = [&](tinyxml2::XMLElement* parent, const char* name, const std::string& text) {
            tinyxml2::XMLElement* el = doc.NewElement(name);
            el->SetText(text.c_str());
            parent->InsertEndChild(el);
        };

        add_node(channel, "title", config::SITE_TITLE);
        add_node(channel, "link", config::SITE_URL);
        add_node(channel, "description", config::SITE_DESCRIPTION);

        for (const auto& post : posts) {
            tinyxml2::XMLElement* item = doc.NewElement("item");
            channel->InsertEndChild(item);

            add_node(item, "title", post["title"]);
            add_node(item, "link", std::string(config::SITE_URL) + "/posts/" + post["id"].get<std::string>());
            add_node(item, "description", post["excerpt"]);
            
            add_node(item, "pubDate", format_date(post["date"], "%a, %d %b %Y %H:%M:%S GMT+8"));
            add_node(item, "guid", post["id"]);
        }

        tinyxml2::XMLPrinter printer;
        doc.Print(&printer);

        return std::string(printer.CStr());
    }

    auto generate_sitemap(const std::vector<nlohmann::json>& posts, const nlohmann::json& categories, const nlohmann::json& tags) -> std::string {
        tinyxml2::XMLDocument doc;
        doc.InsertEndChild(doc.NewDeclaration());

        tinyxml2::XMLElement* urlset = doc.NewElement("urlset");
        urlset->SetAttribute("xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9");
        doc.InsertEndChild(urlset);

        auto add_url = [&](const std::string& path, const std::string& lastmod = "", const char* priority = "0.5") {
            tinyxml2::XMLElement* url = doc.NewElement("url");

            tinyxml2::XMLElement* loc = doc.NewElement("loc");
            loc->SetText((std::string(config::SITE_URL) + path).c_str());
            url->InsertEndChild(loc);

            if (!lastmod.empty()) {
                tinyxml2::XMLElement* lm = doc.NewElement("lastmod");
                lm->SetText(format_date(lastmod, "%Y-%m-%d").c_str());
                url->InsertEndChild(lm);
            }

            tinyxml2::XMLElement* prio = doc.NewElement("priority");
            prio->SetText(priority);
            url->InsertEndChild(prio);

            urlset->InsertEndChild(url);
        };

        add_url("/", "", "1.0");
        add_url("/categories", "", "0.8");
        add_url("/tags", "", "0.8");
        add_url("/links", "", "0.5");
        add_url("/about", "", "0.7");
        add_url("/timeline", "", "0.6");

        for (const auto& cat : categories) {
            add_url("/categories/" + cat["name"].get<std::string>(), "", "0.6");
        }

        for (const auto& tag : tags) {
            add_url("/tags/" + tag["name"].get<std::string>(), "", "0.6");
        }

        for (const auto& post : posts) {
            add_url("/posts/" + post["id"].get<std::string>(), post["date"].get<std::string>(), "0.9");
        }

        tinyxml2::XMLPrinter printer;
        doc.Print(&printer);

        return std::string(printer.CStr());
    }
}