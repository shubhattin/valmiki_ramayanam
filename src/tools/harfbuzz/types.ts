type get_text_svg_path_type = {
    func_name: "get_text_svg_path";
    args: {
        text: string;
        font: string | Uint8Array;
    };
}

type preload_harfbuzzjs_wasm_type = {
    func_name: "preload_harfbuzzjs_wasm";
    args?: undefined,
}

type preload_font_from_url_type = {
    func_name: "preload_font_from_url";
    args: {
        url: string;
    };
}

export type WorkerMessageNoUUID = (get_text_svg_path_type | preload_harfbuzzjs_wasm_type | preload_font_from_url_type)
export type WorkerMessage = WorkerMessageNoUUID & {
    uuid: string;
}