// === consts ===

const DEFAULT_STRING_COUNT      = 6;
const DEFAULT_FRET_COUNT        = 20;
const TEXT_INPUT_DEBOUNCE_MS    = 300;

// === globals ===

let inputs = {
    string_count:   0,
    fret_count:     0,
    root:           "",
    scale:          "",
}

let timer_handles = {}

// === bootstrap ===

$(document).ready(() => {
    let num_default = (txt, default_val) => {
        return parseInt(txt) || default_val;
    };

    let inputs_changed = () => {
        inputs = {
            string_count:   num_default($("#string_count").val(), DEFAULT_STRING_COUNT),
            fret_count:     num_default($("#fret_count").val(), DEFAULT_FRET_COUNT),
            root:           $("#root_select").val(),
            scale:          $("#scale_select").val(),
        }

        update_chart();
    };

    inputs_changed();


    $("#string_count").on("input",
        () => set_debounce("string_count", TEXT_INPUT_DEBOUNCE_MS, inputs_changed))
    $("#fret_count").on("input",
        () => set_debounce("string_count", TEXT_INPUT_DEBOUNCE_MS, inputs_changed))
    $("#root_select").on("change", () => inputs_changed());
    $("#scale_select").on("change", () => inputs_changed());
})

// === functions ===

let set_debounce = (id, delay, callback) => {
    if (timer_handles[id] != null) {
        clearTimeout(timer_handles[id]);
    }

    timer_handles[id] = setTimeout(callback, delay);
}

let update_inputs = () => {
    let num_default = (txt, default_val) => {
        return parseInt(txt) || default_val;
    };

    return {
        string_count:   num_default($("#string_count").val(), DEFAULT_STRING_COUNT),
        fret_count:     num_default($("#fret_count").val(), DEFAULT_FRET_COUNT),
        root:           $("#root_select").val(),
        scale:          $("#scale_select").val(),
    }
}

let update_chart = () => {
    $("#chart_title").text(`${inputs.root} ${inputs.scale}`);

    let chart_display = $("#chart_display");
    chart_display.empty();

    for (let s = 0; s < inputs.string_count; ++s) {
        let string = $(`<tr id="s${s}" class="string"></tr>`);
        // fret_count + 1 so we can also represent an open string
        for (let f = 0; f < inputs.fret_count + 1; ++f) {
            let fret = $(`<td id="s${s}f${f}" class="fret"></td>`);
            if (f === 0) {
                fret.addClass("open");
            }

            string.append(fret);
        }

        chart_display.append(string);
    }

    // one extra row for fret numbers
    let fret_nums = $(`<tr id="fret_nums"></tr>`)
    for (let f = 0; f < inputs.fret_count + 1; ++f) {
        let num = $(`<td class="fret_num">${f}</td>`);
        fret_nums.append(num);
    }

    chart_display.append(fret_nums);
}
