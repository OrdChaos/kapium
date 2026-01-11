#include "../include/md4cCallback.hpp"

/// ============================================================
/// Markdown -> HTML
/// ============================================================

auto md_append_to_string(
    const MD_CHAR* text,
    MD_SIZE size,
    void* userdata
) -> void {
    static_cast<std::string*>(userdata)->append(text, size);
}

auto md_to_html(const std::string& markdown) -> FORMATED_POST {
    const unsigned int PARSER_FLAGS =
        MD_FLAG_COLLAPSEWHITESPACE |
        MD_FLAG_TABLES |
        MD_FLAG_TASKLISTS |
        MD_FLAG_STRIKETHROUGH |
        MD_FLAG_PERMISSIVEURLAUTOLINKS |
        MD_FLAG_PERMISSIVEEMAILAUTOLINKS |
        MD_FLAG_PERMISSIVEWWWAUTOLINKS |
        MD_FLAG_LATEXMATHSPANS;

    MD_TOC_ITEM_T *toc_list = NULL;
    size_t toc_count = 0;

    std::string html;
    int rc = md_html(
        markdown.c_str(),
        (MD_SIZE)markdown.size(),
        md_append_to_string,
        &html,
        PARSER_FLAGS,
        0,
        &toc_list,
        &toc_count
    );

    nlohmann::json toc;
    nlohmann::json toc_json = nlohmann::json::array();

    if (rc == 0 && toc_list != nullptr) {
        for (size_t i = 0; i < toc_count; i++) {
            nlohmann::json item;
            item["level"] = toc_list[i].level;
            item["id"]    = toc_list[i].id;
            item["text"]  = toc_list[i].text;
            toc_json.push_back(item);

            free(toc_list[i].id);
            free(toc_list[i].text);
        }
        free(toc_list);
    }

    FORMATED_POST post(html, toc_json);

    return rc == 0 ? post : FORMATED_POST("", nlohmann::json::array());
}

/// ============================================================
/// Markdown -> Plain Text
/// ============================================================

struct PlainTextCtx {
    std::string out;
};

auto md_plaintext_text(
    MD_TEXTTYPE type,
    const MD_CHAR* text,
    MD_SIZE size,
    void* userdata
) -> int {
    auto* ctx = static_cast<PlainTextCtx*>(userdata);

    switch (type) {
        case MD_TEXT_NORMAL:
        case MD_TEXT_CODE:
        case MD_TEXT_ENTITY:
            ctx->out.append(text, size);
            break;

        case MD_TEXT_SOFTBR:
            ctx->out.push_back('\n');
            break;

        default:
            break;
    }
    return 0;
}

static auto noop_block(MD_BLOCKTYPE, void*, void*) -> int { return 0; }
static auto noop_span(MD_SPANTYPE, void*, void*) -> int { return 0; }

auto md_to_plaintext(const std::string& markdown) -> std::string {
    PlainTextCtx ctx;

    MD_PARSER parser {};
    parser.text = md_plaintext_text;
    parser.enter_block = noop_block;
    parser.leave_block = noop_block;
    parser.enter_span = noop_span;
    parser.leave_span = noop_span;

    int rc = md_parse(
        markdown.c_str(),
        (MD_SIZE)markdown.size(),
        &parser,
        &ctx
    );

    return rc == 0 ? ctx.out : std::string{};
}