;(function(root) {

// Properties __________________________________________________________________

    var MAX_TEMP = 70;
    var MIN_TEMP = 10;

// Constructor _________________________________________________________________

    function WeatherStation(api_key) {
        var self = this,
            current_hour = new Date().getHours(),
            is_night = current_hour > 22 || current_hour < 7;

        if (is_night) {
            document.body.style.opacity = 0.25;
        }

        this.api = new WeatherApi(api_key, 'NY', 'Brooklyn');

        Q.longStackSupport = true;
        Q.all([
            this._getAlerts(),
            this._getCurrent(),
            this._getToday(),
            this._getHourly()
        ]).spread(function(alerts_response, current_response, today_response, hourly_forecast_response) {
            var alerts = alerts_response.alerts;
            var current = current_response.current_observation;
            var today = today_response.forecast.simpleforecast.forecastday[0];
            var hourly = hourly_forecast_response.hourly_forecast;
            var timestamps = [];
            var temperatures = [];
            var precipitation = [];
            var condition_icon = document.getElementById('weather_condition');

            // Display alerts
            if (alerts.length) {
                // @todo iterate and display alerts
            }

            // Display current conditions
            document.getElementById('current_temp').textContent = Math.round(current.temp_f) + '°';
            document.getElementById('current_high').textContent = Math.round(today.high.fahrenheit) + '°';
            document.getElementById('current_low').textContent = Math.round(today.low.fahrenheit) + '°';

            switch (current.icon) {
                case 'chanceflurries':
                case 'flurries':
                case 'chancesnow':
                case 'snow':
                    condition_icon.src = 'images/snowy.svg';
                    break;

                case 'chancerain':
                case 'rain':
                case 'chancesleet':
                case 'sleet':
                    condition_icon.src = 'images/rainy.svg';
                    break;

                case 'chancetstorms':
                case 'tstorms':
                    condition_icon.src = 'images/stormy.svg';
                    break;

                case 'clear':
                case 'sunny':
                    condition_icon.src = 'images/sunny.svg';
                    break;

                case 'cloudy':
                    condition_icon.src = 'images/cloudy.svg';
                    break;

                case 'mostlycloudy':
                case 'partlysunny':
                    condition_icon.src = 'images/partly_sunny.svg';
                    break;

                case 'mostlysunny':
                case 'partlycloudy':
                    condition_icon.src = 'images/partly_cloudy.svg';
                    break;

                default:
                    condition_icon.style.display = 'none';

            }

            // Parse hourly forecast (12 hours max)
            for (var i = 0, limit = 12; i < limit; i++) {
                timestamps.push(hourly[i].FCTTIME.civil);
                temperatures.push(parseInt(hourly[i].temp.english, 10));
                precipitation.push(parseInt(hourly[i].pop, 10));
            }

            // Render chart
            self._buildChart(timestamps, temperatures, precipitation);
        }).catch(function(x) {
            console.error(x);
        });
    }

// Private Methods ______________________________________________________________

    WeatherStation.prototype._getAlerts = function() {
        return this.api.makeCall('alerts');
    };

    WeatherStation.prototype._getCurrent = function() {
        return this.api.makeCall('conditions');
    };

    WeatherStation.prototype._getToday = function() {
        return this.api.makeCall('forecast');
    };

    WeatherStation.prototype._getHourly = function() {
        return this.api.makeCall('hourly');
    };

    WeatherStation.prototype._getHourlyTenDay = function() {
        return this.api.makeCall('hourly10day');
    };

    WeatherStation.prototype._getAstronomy = function() {
        return this.api.makeCall('astronomy');
    };

    WeatherStation.prototype._buildChart = function(timestamps, temperatures, precipitation) {
        var chart;

        chart = new Highcharts.Chart({
            chart: {
                renderTo: document.getElementById('weather_chart'),
                backgroundColor: '#000'
            },
            credits: {
                enabled: false
            },
            title: {
                text: 'Hourly Forecast',
                style: {
                    color: '#666',
                    fontFamily: 'Source Sans Pro',
                    fontWeight: 300
                }
            },
            legend: {
                itemStyle: {
                    color: '#666',
                    fontFamily: 'Source Sans Pro',
                    fontWeight: 400
                },
                itemHoverStyle: {
                    color: '#666'
                }
            },
            plotOptions: {
                spline: {
                    dataLabels: {
                        enabled: true,
                        format: '{y}°',
                        style: {
                            color: '#fff',
                            fontFamily: 'Source Sans Pro',
                        },
                        y: 30
                    }
                },
                column: {
                    dataLabels: {
                        enabled: true,
                        formatter: function(y) {
                            if (this.y > 0) {
                                return this.y + '%';
                            }
                        },
                        style: {
                            color: '#fff',
                            fontFamily: 'Source Sans Pro',
                        },
                        y: -10
                    }
                }
            },
            xAxis: {
                title: {
                    text: 'Time',
                    style: {
                        fontFamily: 'Source Sans Pro'
                    }
                },
                categories: timestamps,
                lineColor: '#333',
                tickColor: '#333',
                gridLineColor: '#333',
                labels: {
                    style: {
                        color: '#666',
                        fontFamily: 'Source Sans Pro',
                    }
                }
            },
            yAxis: [{
                labels: {
                    format: '{value}°F',
                    style: {
                        fontFamily: 'Source Sans Pro'
                    }
                },
                title: {
                    text: 'Temperature',
                    style: {
                        fontFamily: 'Source Sans Pro'
                    }
                },
                lineColor: '#333',
                gridLineColor: '#333',
                min: MIN_TEMP,
                max: MAX_TEMP
            },
            {
                labels: {
                    format: '{value}%',
                    style: {
                        color: '#666',
                        fontFamily: 'Source Sans Pro',
                    }
                },
                title: {
                    text: 'Precipitation',
                    style: {
                        fontFamily: 'Source Sans Pro'
                    }
                },
                lineColor: '#333',
                gridLineColor: '#333',
                opposite: true,
                min: 0,
                max: 100
            }],
            series: [{
                name: 'Temperature',
                data: temperatures,
                type: 'spline',
                index: 1,
                color: '#f45b5b',
                tooltip: {
                    valueSuffix: '°F'
                }
            },
            {
                name: 'Precipitation',
                data: precipitation,
                type: 'column',
                index: 0,
                color: '#2a7fdb',
                borderWidth: 0,
                tooltip: {
                    valueSuffix: '%'
                },
                yAxis: 1
            }],
            tooltip: {
                shared: true
            }
        });
    };

// Exports _____________________________________________________________________

    root.WeatherStation = WeatherStation;

}(window));
