//window.onload = function() {

    const range_max_default = 15000;        // mm
    const range_resol_default = 80;         // mm
    const velocity_max_default = 5000;      // mm/s
    const velocity_resol_default = 500;     // mm/s
    const frame_duration_default = 50;      // ms
    const snr_thresh_default = 15;          // dB
    const rx_gain_default = 30;             // dB
    const power_backoff_default = 0;        // dB
    const mti_weight_default = 0;           // 0 / 1..99 = disable / weight

    // var params;

    function logging(text) {
        var textarea = document.getElementById("textarea_log");
        textarea.value += "\n----------------\n";
        textarea.value += text;
        textarea.scrollTop = textarea.scrollHeight;
    }

    function get_Xwr16xx_params() {
        return {
            range_max: $("#range_max").val(),
            range_resol: $("#range_resol").val(),
            velocity_max: $("#velocity_max").val(),
            velocity_resol: $("#velocity_resol").val(),
            frame_duration: $("#frame_duration").val(),
            snr_thresh: $("#snr_thresh").val(),
            rx_gain: $("#rx_gain").val(),
            power_backoff: $("#power_backoff").val(),
            mti_weight: $("#mti_weight").val()
        }
    }

    function put_Xwr16xx_params(params) {
        $("#range_max").val(parseInt(params.range_max));
        $("#range_resol").val(parseInt(params.range_resol));
        $("#velocity_max").val(parseInt(params.velocity_max));
        $("#velocity_resol").val(parseInt(params.velocity_resol));
        $("#frame_duration").val(parseInt(params.frame_duration));
        $("#snr_thresh").val(parseInt(params.snr_thresh));
        $("#rx_gain").val(parseInt(params.rx_gain));
        $("#power_backoff").val(parseInt(params.power_backoff));
        $("#mti_weight").val(parseInt(params.mti_weight));
    }

    function get_UART_params() {
        return {
            port: $('#uart_port').val(),
            baud_rate: $('#uart_baud_rate').val(),
            byte_size: $('#uart_byte_size').val(),
            parity: $('#uart_parity').val(),
            stop_bits: $('#uart_stop_bits').val(),
            time_out: $('#uart_timeout').val()
        }
    }

    $(document).ready(function () {
        $("#range_max").val(range_max_default);
        $("#range_resol").val(range_resol_default);
        $("#velocity_max").val(velocity_max_default);
        $("#velocity_resol").val(velocity_resol_default);
        $("#frame_duration").val(frame_duration_default);
        $("#snr_thresh").val(snr_thresh_default);
        $("#rx_gain").val(rx_gain_default);
        $("#power_backoff").val(power_backoff_default);
        $("#mti_weight").val(mti_weight_default);
    });

    $("#button_uart_check").click(function () {
        var data_json = { "cmd": "uart_check" };
        logging("UART CHECK REQUEST\n" + JSON.stringify(data_json));
        $.ajax({
            url: "",
            type: "POST",
            data: JSON.stringify(data_json),
            success: function (data, status) {
                var res = $.parseJSON(data);
                if (status === "success" && res.status === "OK") {
                    var select = document.getElementById("uart_port");
                    $('#uart_port').find('option').remove();
                    for (var i = 0; i < res["ports"].length; i++) {
                        var option = document.createElement("option");
                        option.setAttribute("value", res["ports"][i]);
                        option.text = res["ports"][i];
                        select.add(option);
                    }
                }
                logging("UART CHECK RESPONSE\n" + data)
            },
            error: function (jqXhr, textStatus, errorThrown) {
                logging(errorThrown);
            }
        });
    });

    $("#button_run").click(function () {
        var board_params = get_Xwr16xx_params();
        var uart_params = get_UART_params();

        var data_json = {
            "cmd": "run",
            "args": [
                { "platform": "Xwr16xx",
                  "params": board_params
                },
                { "type": "UART",
                    "params": uart_params
                }]
        };
        logging("RUN REQUEST\n" + JSON.stringify(data_json));
        $.ajax({
            url: "",
            type: "POST",
            data: JSON.stringify(data_json),
            success: function (data, status) {
                logging("RUN RESPONSE, " + status + "\n" + data);
            },
            error: function (jqXhr, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });
    });

    $("#button_reset").click(function (){
        $("#range_max").val(range_max_default);
        $("#range_resol").val(range_resol_default);
        $("#velocity_max").val(velocity_max_default);
        $("#velocity_resol").val(velocity_resol_default);
        $("#frame_duration").val(frame_duration_default);
        $("#snr_thresh").val(snr_thresh_default);
        $("#rx_gain").val(rx_gain_default);
        $("#power_backoff").val(power_backoff_default);
        $("#mti_weight").val(mti_weight_default);
    });

    $("#button_load").click(function () {
        document.getElementById('file_browser').click();
    });

    $("#button_save").click(function () {
        var ini_string = "[Xwr16xx]";
        ini_string += "\nrange_max = " + $("#range_max").val();
        ini_string += "\nrange_resol = " + $("#range_resol").val();
        ini_string += "\nvelocity_max = " + $("#velocity_max").val();
        ini_string += "\nvelocity_resol = " + $("#velocity_resol").val();
        ini_string += "\nframe_duration = " + $("#frame_duration").val();
        ini_string += "\nsnr_thresh = " + $("#snr_thresh").val();
        ini_string += "\nrx_gain = " + $("#rx_gain").val();
        ini_string += "\npower_backoff = " + $("#power_backoff").val();
        ini_string += "\nmti_weight = " + $("#mti_weight").val();

        var blob = new Blob([ini_string], { type: 'text/plain' });
        var anchor = document.createElement('a');
        anchor.download = $("#save_filename").val() + ".ini";
        anchor.href = (window.URL || window.URL).createObjectURL(blob);
        anchor.dataset.downloadurl = ['text/plain', anchor.download, anchor.href].join(':');
        anchor.click();
    });

    $("#button_exit").click(function () {
        var data_json = {"cmd": "exit"};
        logging("EXIT REQUEST\n" + JSON.stringify(data_json));
        $.ajax({
            url: "",
            type: "POST",
            data: JSON.stringify(data_json),
            success: function (data, status) {
                var res = $.parseJSON(data);
                logging("EXIT RESPONSE, " + status + "\n" + data);
                if (status === 'success' && res.status === 'OK') {
                    alert("Exit: " + data + "\nStatus: " + status);
                    window.close()
                }
            },
            error: function (jqXhr, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });
    });

    function onFileSelected(event) {
        if (event.files && event.files[0]) {
            if (event.files[0].name.split(".")[1] !== "ini") {
                logging("Error: not INI file, " + event.files[0].name);
                alert("Error: not INI file, " + event.files[0].name);
                return;
            }
            var reader = new FileReader();
            reader.onload = function (e) {
                var output = e.target.result;
                var data_json = {"cmd": "load", "args": [output]};
                logging("LOAD REQUEST\n" + JSON.stringify(data_json));
                $.ajax({
                    url: '',
                    type: 'POST',
                    data: JSON.stringify(data_json),
                    success: function (data, status) {
                        logging("LOAD RESPONSE, " + status + "\n" + data);
                        var res = $.parseJSON(data);
                        if (res.Xwr16xx !== undefined) {
                            put_Xwr16xx_params(res.Xwr16xx);
                            logging("LOAD Xwr16xx PARAMS to GUI");
                        }
                    },
                    error: function (jqXhr, textStatus, errorThrown) {
                        console.log(errorThrown);
                    }
                })
            };
            reader.readAsText(event.files[0]);
            $("#file_browser")[0].value = '';
        }
    }
//};
