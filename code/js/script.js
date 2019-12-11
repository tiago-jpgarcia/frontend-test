(function(){

    // HTML ELEMENTS
    const inputName = document.querySelector("[name^=title");
    const elem = document.getElementById('allmovies');
    const elemMovie = document.getElementById('single-movie');
    const load = document.getElementById('load');
    const moviesContainer = document.getElementsByClassName('movies-container')[0];

    // VARIABLES API OMDB
    const key = 'a86569f6';
    const url = 'http://www.omdbapi.com/';

    // LOGIC VARIABLES
    let inputValue;
    let movies = {};
    let singleMovie = {};
    let totalMovies = 0;
    let totalPages = 0;
    let actualPage = 1;

    // DETECT CLICK ON ENTER KEY TO MAKE API CALLS
    inputName.addEventListener("keypress", function(e){
        let code = e.keyCode || e.which;
        if (code === 13) {
            e.preventDefault();
            inputValue = this.value;
            actualPage = 1;
            elem.innerHTML = '';
            apiCall();
            elemMovie.style.display = "none";
        }
    });

    // API CALL, SHOW AND HIDE SOME ELEMENTS
    function apiCall() {
        getMovies(inputValue)
        .then(function(data) {
            Object.assign(movies, data.Search);
            totalMovies = data.totalResults;
            totalPages = totalMovies / 10;
            listMovies();
            elem.style.display = "flex";
            moviesContainer.style.display = "block";
        });
    }
    
    //GET ALL MOVIES FROM API CALL
    async function getMovies(value) {

        let api = url + '?s='+ value +'&apikey='+ key+'&page='+actualPage;

        let response = await fetch(api);
        let data = await response.json()
        
        return data;
    }
    
    //CREATE A LIST TO ADD ON HTML
    function listMovies() {
        let moviesContainer = '';

        if (Object.entries(movies).length === 0 && actualPage ===1) {
            moviesContainer += '<div class="col -xs-12">' +
                                    '<p class="no-result">Sem Resultados</p>'
                               '</div>'
        }   

        Object.keys(movies).forEach(function (item) {
                                
            moviesContainer +=   '<div class="col -xs-6 -sm-4 -md-3 -lg-2">' +
                                    '<div data-id="'+movies[item].imdbID+'" class="card">' +
                                        '<div class="title">' +
                                            '<p>'+ movies[item].Title +'</p>' +
                                        '</div>' +
                                        '<div class="poster">';
                                            if (movies[item].Poster === 'N/A') {
                                                moviesContainer +=  '<img alt="'+movies[item].Title+'" src="images/no-image.png" />'
                                            } else {
                                                moviesContainer += '<img alt="'+movies[item].Title+'" src="'+movies[item].Poster+'" />'
                                            }
            moviesContainer +=          '</div>' +
                                    '</div>' +
                                '</div>';
        });
        movies = {};
        elem.innerHTML = elem.innerHTML + moviesContainer;
        totalPages > actualPage ? load.style.display = 'block' : load.style.display = "none";
        setEvents();
    }

    //CREATE BUTTON LOAD MORE
    load.addEventListener('click', function() {
        actualPage++;
        apiCall();
    });

    // SET CARDS WITH CLICK EVENT
    function setEvents() {
        cards = document.getElementsByClassName("card");
        for (var i = 0; i < cards.length; i++) {
            cards[i].addEventListener('click', function(){
                let imdb = this.getAttribute('data-id');
                elemMovie.innerHTML = '';
                createSingleMovie(imdb);
                elemMovie.style.display = "flex";
            })
        }
    }


    function createSingleMovie(imdb) {
        getMovie(imdb)
        .then(function(data) {
            Object.assign(singleMovie, data);
            listMovie(imdb);
        });
    }

    // REQUEST FOR A SINGLE MOVIE WITH MORE DETAILS
    async function getMovie(imdb) {
        let api = url + '?i='+ imdb +'&apikey='+ key;

        let response = await fetch(api);
        let data = await response.json()
        
        return data;
    }

    // CREATE ALL ELEMENT MOVIE AFTER API RESPONSE
    function listMovie(imdb) {
        let movieContainer = '';
        let actor = singleMovie.Actors.split(',');
        let genre = singleMovie.Genre.split(',');

        movieContainer += '<div class="col -xs-12 -md-8 left-side">' +
                            '<div class="back"><p>Back Page</p></div> '+
                            '<div class="title">' +
                                '<h2>'+singleMovie.Title+'</h2>' +
                                '<div data-imdb="'+imdb+'" class="like">';
        movieContainer +=             checkMovieExists(imdb) ? '<img id="like-image" src="images/gostar.png" />' : '<img id="like-image" src="images/gostar_filled.png" />';
        movieContainer +=        '</div>' +
                            '</div>' +
                            '<div class="plot">' +
                                '<p>' +singleMovie.Plot+ '</p>' +
                            '</div>';
        movieContainer +=   '<div class="details">'+
                                '<div class="actors">'+
                                    '<p>Cast</p>'+
                                    '<ul>';
                                        for (i=0; i< actor.length; i++) {
                                            movieContainer += '<li>'+actor[i]+'</li>'
                                        }
        movieContainer +=           '</ul>'+
                                '</div>' +
                                '<div class="genre">'+
                                    '<p>Genre</p>'+
                                    '<ul>';
                                        for (i=0; i< genre.length; i++) {
                                            movieContainer += '<li>'+genre[i]+'</li>'
                                        }
        movieContainer +=           '</ul>' +
                                '</div>'+
                                '<div class="director">'+
                                    '<p>Director</p>'+
                                    '<ul>'+
                                        '<li>'+singleMovie.Director+'</li>'+
                                    '</ul>'+
                            '</div>'+
                            '</div>'+
                        '</div>'+
                        '<div class="col -xs-12 -md-4 -center-xs -end-md right-side">';
                           if (singleMovie.Poster === 'N/A') {
                                movieContainer +=  '<img alt="'+singleMovie.Title+'" src="images/no-image.png" />'
                            } else {
                                movieContainer += '<img alt="'+singleMovie.Title+'" src="'+singleMovie.Poster+'" />'
                            }
        movieContainer +='</div>';
        
        //elem.style.display = "none";
        moviesContainer.style.display = "none";
        elemMovie.innerHTML = elemMovie.innerHTML + movieContainer;

        // ADD LOGIC ON LIKE BUTTON, SAVE MOVIE LIKED ON bROWSER STORAGE
        document.getElementsByClassName('like')[0].addEventListener('click', function(){
            let imdbId = this.getAttribute('data-imdb');
            let storage = localStorage.getItem('imdb') || '';

            let addStorage = checkMovieExists(imdbId);

            if(addStorage) {
                document.getElementById('like-image').src="images/gostar_filled.png"
                localStorage.setItem('imdb', storage + JSON.stringify(imdbId) + ';');
            }else{
                document.getElementById('like-image').src="images/gostar.png"
                deleteStorage(storage, imdbId);
            }
        });

        // ADD LOGIC BACK BUTTON
        document.getElementsByClassName('back')[0].addEventListener('click', function(){
            elemMovie.style.display = "none";
            elem.style.display = "flex";
            moviesContainer.style.display = "block";
        });
    }

    // DELETE BROWSER STORAGE
    function deleteStorage(storage, imdbId) {
        let newStorage = '';
        storage = storage.split(';');
        for(i=0; i< storage.length; i++) {
            if (storage[i] != '"'+imdbId+'"') {
                newStorage += storage[i]+';';
            }
        }
        newStorage = newStorage.substring(";", newStorage.length - 1);

        localStorage.setItem('imdb', newStorage);
    }

    // CHECK IF A MOVIE ALREADY EXISTS ON BROWSER STORAGE
    function checkMovieExists(imdbId) {
        let storage = localStorage.getItem('imdb');
        if (storage === null) return true;
        storage = storage.split(';');
        for(i=0; i< storage.length; i++) {
            if (storage[i] === '"'+imdbId+'"') {
                return false;
            }
        }

       return true;
    }
})();