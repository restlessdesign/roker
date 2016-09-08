;(function(root) {

// Constants ___________________________________________________________________

    const BASE_URL = '//api.wunderground.com/api/';

// Constructor _________________________________________________________________

    function WeatherApi(public_key, state, city) {
        this.api_url = BASE_URL + public_key;
        this.state = state;
        this.city = city;
    }

// Public Methods ______________________________________________________________

    WeatherApi.prototype.makeCall = function(method_name) {
        var deferred = Q.defer();
        var request_url = this.api_url + '/' + method_name + '/q/' + this.state + '/' + this.city + '.json';

        JSONP({
            url: request_url,
            success: deferred.resolve
        });

        return deferred.promise;
    };

// Exports _____________________________________________________________________

    root.WeatherApi = WeatherApi;

}(window));
