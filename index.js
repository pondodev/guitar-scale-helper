// === consts ===

const DEFAULT_STRING_COUNT      = 6;
const DEFAULT_FRET_COUNT        = 20;
const TEXT_INPUT_DEBOUNCE_MS    = 300;

const NOTES = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];
// all note intervals are measured in semitones relative to the root, sans the octave
const SCALE_INTERVALS = {
    major:          [0, 2, 4, 5, 7, 9, 11],
    nat_minor:      [0, 2, 3, 5, 7, 8, 10],
    harm_minor:     [0, 2, 3, 5, 7, 8, 11],
    major_pent:     [0, 2, 4, 7, 9],
    minor_pent:     [0, 3, 5, 7, 10],
    major_blues:    [0, 2, 3, 4, 7, 9],
    minor_blues:    [0, 3, 5, 6, 7, 10],
};

// === globals ===

let inputs = {
    string_count:   0,
    fret_count:     0,
    root:           0,
    scale:          "",
}

let timer_handles = {}
let current_scale = []

// === bootstrap ===

$(document).ready(() => {
    let update = () => {
        update_inputs();
        update_chart();
    };


    $("#string_count").on("input",
        () => set_debounce("string_count", TEXT_INPUT_DEBOUNCE_MS, update))
    $("#fret_count").on("input",
        () => set_debounce("string_count", TEXT_INPUT_DEBOUNCE_MS, update))
    $("#root_select").on("change", () => update());
    $("#scale_select").on("change", () => update());

    update();
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

    inputs = {
        string_count:   num_default($("#string_count").val(), DEFAULT_STRING_COUNT),
        fret_count:     num_default($("#fret_count").val(), DEFAULT_FRET_COUNT),
        root:           num_default($("#root_select").val(), 0),
        scale:          $("#scale_select").val(),
    }
}

let update_chart = () => {
    $("#chart_title").text(`${NOTES[inputs.root]} ${inputs.scale}`);

    resolve_current_scale();
    refresh_chart_display();

    // TODO: display fret markers for the current scale
    let fret_marker = $(`<div class="fret_marker"></div>`);
    $("#s0f1 > .fret_inner").append(fret_marker);

    fret_marker = $(`<div class="fret_marker root_note"></div>`);
    $("#s1f2 > .fret_inner").append(fret_marker);
}

let get_current_scale_intervals = () => {
    switch (inputs.scale) {
        case "major":               return SCALE_INTERVALS["major"];
        case "natural minor":       return SCALE_INTERVALS["nat_minor"];
        case "harmonic minor":      return SCALE_INTERVALS["harm_minor"];
        case "major penatonic":     return SCALE_INTERVALS["major_pent"];
        case "minor pentatonic":    return SCALE_INTERVALS["minor_pent"];
        case "major blues":         return SCALE_INTERVALS["major_blues"];
        case "minor blues":         return SCALE_INTERVALS["minor_blues"];
        default:
            console.error(`selected a wrong scale type ????? (${inputs.scale})`);
            return SCALE_INTERVALS["major"];
    }
}

let resolve_current_scale = () => {
    current_scale = []

    let intervals = get_current_scale_intervals();
    for (const i of intervals) {
        let note = (inputs.root + i) % NOTES.length;
        current_scale.push(note);
    }

    let scale_str = "";
    for (const note of current_scale) {
        scale_str += `${NOTES[note]} `;
    }
    $("#scale_display").text(`scale: ${scale_str.trim()}`);
}

let refresh_chart_display = () => {
    let chart_display = $("#chart_display");
    chart_display.empty();

    for (let s = 0; s < inputs.string_count; ++s) {
        let string = $(`<tr id="s${s}" class="string"></tr>`);
        // fret_count + 1 so we can also represent an open string
        for (let f = 0; f < inputs.fret_count + 1; ++f) {
            let fret = $(`<td id="s${s}f${f}" class="fret"><div class="fret_inner"></div></td>`);
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
