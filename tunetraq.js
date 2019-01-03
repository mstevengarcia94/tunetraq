var Display = React.createClass({
    getInitialState: function() {
        return {
            loading: false,
            profile: false,
            username: "",
            option: "",
            years: [],
            albums: []
        };
    },

    showLoading: function (username, option) {

        var _this = this;
        document.getElementById("display").style.opacity = "1";
        document.getElementById("display").style.opacity = "0";

        setTimeout(function() {
            afterFade(username, _this);
        }, 300);

        var afterFade = function (username, _this) {
            _this.setState({
                loading: true,
                username: username,
                option: option
            });
        };
    },

    returnToLogin: function () {
        this.setState({
            loading: false
        });
    },

    showProfile: function (username, playcount, topScrobbles, topTick, tickmarks, years, albums) {

        var _this = this;
        document.getElementById("display").style.opacity = "1";
        document.getElementById("display").style.opacity = "0";

        setTimeout(function() {

            afterFade(username, playcount, topScrobbles, topTick, tickmarks, years, albums, _this);
        }, 300);

        var afterFade = function (username, playcount, topScrobbles, topTick, tickmarks, years, albums, _this) {
            _this.setState({
                loading: false,
                profile: true,
                username: username,
                playcount: playcount,
                topScrobbles: topScrobbles,
                topTick: topTick,
                tickmarks: tickmarks,
                years: years,
                albums: albums
            });
        };
    },

    render: function () {
        if (!this.state.profile && !this.state.loading) {
            return (
                <div id="display">
                    <Intro/>
                    <section className="container-fluid">
                        <section className="col-sm-6" id="description">
                            <Description/>
                            <Preview/>
                        </section>
                        <section className="col-sm-6" id="login">
                            <Login showLoading={this.showLoading}/>
                        </section>
                    </section>
                </div>
            );
        } else if (this.state.loading) {
            document.getElementById("display").style.opacity = "0";
            return (
                <div id="display">
                    <LoadScreen username={this.state.username} showProfile={this.showProfile} option={this.state.option} returnToLogin={this.returnToLogin}/>
                </div>
            );
        } else {
            document.getElementById("display").style.opacity = "0";
            //document.getElementById("display").style.opacity = "1";
            return (
                <div id="display">
                    <Profile username={this.state.username} playcount={this.state.playcount} years={this.state.years} albums={this.state.albums}
                             topScrobbles={this.state.topScrobbles} topTick={this.state.topTick} tickmarks={this.state.tickmarks} option={this.state.option}/>
                </div>
            );
        }
    }
});

var Intro = React.createClass({
    render: function () {
        return (
            <header className="container-fluid jumbotron">
                <div className="row jumboRow">
                    <div className="logoContainer col-sm-2 col-sm-offset-2">
                        <img className="logo" src="tunetraq_logo.png"/>
                    </div>
                    <h1 className="col-sm-6">tunetraq</h1>
                </div>
            </header>
        );
    }
});

var Preview = React.createClass({
    render: function () {
        return (
            <section className="container-fluid preview">

            </section>
        );
    }
});

var Description = React.createClass({
    render: function () {
        return (
            <p>tunetraq gets a timeline of the albums you listen to (using last.fm)
                and lets you see which years you have listened to the most music from,
                as well as your top albums from each year.
            </p>
        );
    }
});

var Login = React.createClass({
    getInitialState: function () {
        return {
            username: '',
            password: '',
            selectedOption: 'top 100 albums'
        };
    },
    handleChange: function (event) {
        if (event.target.name == "username") {
            this.setState({username: event.target.value});
        } else {
            this.setState({password: event.target.value});
        }
    },
    handleSubmit: function (event) {
        this.props.showLoading(this.state.username, this.state.selectedOption);
        event.preventDefault();
    },
    handleOptionChange: function (event) {
        this.setState({selectedOption: event.target.value});
    },

    render: function () {
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <h3>enter last.fm username</h3>
                    <input type="text" name="username" value={this.username} onChange={this.handleChange} required/><br/>
                    <h3>show results for</h3>

                    <div id="albumModeFirstSet">
                        <label className="albumModeContainer">
                            <input type="radio" value="top 100 albums"
                                   checked={this.state.selectedOption === 'top 100 albums'}
                                   onChange={this.handleOptionChange}/>
                            <span className="albumMode">top 100 albums</span>
                        </label>
                        <label className="albumModeContainer">
                            <input type="radio" value="top 500 albums"
                                   checked={this.state.selectedOption === 'top 500 albums'}
                                   onChange={this.handleOptionChange}/>
                            <span className="albumMode">top 500 albums</span>
                        </label>
                    </div>
                    <div id="albumModeSecondSet">
                        <label className="albumModeContainer">
                            <input type="radio" value="top 1000 albums"
                                   checked={this.state.selectedOption === 'top 1000 albums'}
                                   onChange={this.handleOptionChange}/>
                            <span className="albumMode">top 1000 albums</span>
                        </label>
                        <label className="albumModeContainer">
                            <input type="radio" value="all albums"
                                   checked={this.state.selectedOption === 'all albums'}
                                   onChange={this.handleOptionChange}/>
                            <span className="albumMode">all albums</span>
                        </label>
                    </div>

                    <input type="submit" value="enter" id="submit-btn"/>
                </form>
            </div>
        );
    }
});

var LoadScreen = React.createClass({

    getInitialState: function() {
        document.getElementById("display").style.opacity = "0";
        document.getElementById("display").style.opacity = "1";
        return {
            totalPages: 0,
            playcount: 0,
            years: [],
            albums: [],
            albumsWithYears: [],
            albumCounter: 0,
            earliestYear: 2019,
            topReleaseCount: 0,
            nullYearCounter: 0,
            albumsPerRequest: 500,
            errorMode: false,
            currentAlbum: {
                name: "",
                "@attr": {
                    rank: "0"
                }
            }
        };
    },

    componentWillMount: function() {
        var _this = this;
        var pageCount = 1;

        this.serverRequest =
            axios
                .get("requests.php" , {
                    params: {
                        method: "user.getinfo",
                        user: _this.props.username,
                        format: "json",
                        type: "get_plays"
                    }
                })
                .then(function(result) {
                    if (result.data.error == "6") {
                        alert("No last.fm user with that name.");
                        _this.props.returnToLogin();
                    } else if (result.data.user.playcount == "0") {
                        alert("No data for this last.fm user.");
                        _this.props.returnToLogin();
                    } else {
                        /*_this.setState({
                         playcount: result.data.user.playcount
                         });*/
                    }
                });
        if (this.props.option === "top 100 albums") {
            this.getAlbums("user.gettopalbums", this.props.username, "100", pageCount, []);
        } else if (this.props.option === "top 500 albums") {
            this.getAlbums("user.gettopalbums", this.props.username, "500", pageCount, []);
        } else {
            this.getAlbums("user.gettopalbums", this.props.username, "1000", pageCount, []);
        }
    },

    getAlbums: function (method, username, limit, pageCount, albums) {
        var albumsSoFar = albums;
        var _this = this;
        this.serverRequest =
            axios
                .get("requests.php", {
                    params: {
                        method: method,
                        user: username,
                        limit: limit,
                        page: pageCount,
                        format: "json",
                        type: "get_albums"
                    }
                })
                .then(function(result) {
                    //console.log("in the then function from getAlbums");

                    // if totalPages is 0, set to totalPages
                    if (_this.state.totalPages == 0) {
                        _this.setState({totalPages: result.data.topalbums["@attr"].totalPages});
                    }

                    pageCount++;
                    albumsSoFar = albumsSoFar.concat(result.data.topalbums.album);

                    //if page count is not total pages yet, then add to total albums, increment page count and run again
                    if (pageCount <= _this.state.totalPages && _this.props.option === "all albums") {

                        _this.getAlbums(method, username, limit, pageCount, albumsSoFar);
                    }
                    else {
                        _this.setState({albums: albumsSoFar});
                        _this.getPlaycount();
                        _this.getAllReleaseYears(_this.state.albums, 0);
                    }
                });
    },

    getPlaycount: function () {
        var tempCount = 0;
        for (var i=0; i<this.state.albums.length; i++) {
            tempCount += parseInt(this.state.albums[i].playcount);
        }
        this.setState({playcount: tempCount});
    },

    getAllReleaseYears: function (albums, nextIndex) {
        var _this = this;
        var albumsJustYears = [];

        for (var i=0; i<Math.min(_this.state.albumsPerRequest, albums.length); i++) {
            var artist = albums[i]["artist"]["name"];
            var releaseTitle = albums[i]["name"];

            var album = {
                "artist": artist,
                "releaseTitle": releaseTitle
            }

            albumsJustYears.push(album);
        }

        $.ajax({
            method: "POST",
            url: "get_release_year.php",
            data: {
                "albums": albumsJustYears
            }
        })
            .done(function(msg) {
                //set albumsWithYears to response
                var albumsWithYears = JSON.parse(msg);

                //check for the completeness of the last item in albumsWithYears
                var lastAlbum = albumsWithYears[albumsWithYears.length-1];

                //if it is not complete, drop it
                if(!lastAlbum.hasOwnProperty("artist") || !lastAlbum.hasOwnProperty("releaseTitle") || !lastAlbum.hasOwnProperty("releaseYear")) {
                    albumsWithYears.pop();
                };

                //add years to this.state.albums
                var newAlbums = _this.state.albums;

                for (var i=0; i<albumsWithYears.length; i++) {
                    newAlbums[i+nextIndex].releaseYear = albumsWithYears[i].releaseYear;
                }

                _this.setState({albums: newAlbums});

                //slice albums to send remaining albums with no years to the next call of getReleaseYears
                nextIndex += albumsWithYears.length;
                var remainingAlbums = _this.state.albums.slice(nextIndex, _this.state.albums.length);

                //if remainingAlbums length is larger than 0, run getAllReleaseYears again with this.state.albums array as argument
                if (remainingAlbums.length > 0) {
                    _this.getAllReleaseYears(remainingAlbums, nextIndex);
                }
                //else, we have completely processed all albums now
                //loop through each album in albumsWithYears array and run sortAlbum on each one
                else {
                    //call sortAlbum for each album in the array
                    for (var i=0; i<_this.state.albums.length; i++) {
                        _this.sortAlbum(_this.state.albums[_this.state.albumCounter]);
                    }
                }
            }).fail(function () {
                if (_this.state.errorMode === false) {
                    _this.setState({errorMode: true});
                    _this.setState({albumsPerRequest: 1});

                    // try again with the same albums array
                    _this.getAllReleaseYears(albums, nextIndex);
                } else {
                    // add a null year value
                    albumsJustYears[0]['releaseYear'] = null;

                    if (albumsJustYears[0]['releaseYear'] == null) {
                        _this.setState({nullYearCounter: _this.state.nullYearCounter + 1});
                        console.log('NULL YEAR ALBUM #' + _this.state.nullYearCounter + ': ');
                        console.log('here was the sent data that failed: ');
                        console.log(albumsJustYears);
                    }

                    // reset errorFlag and albumsPerRequest
                    _this.setState({errorMode: false});
                    _this.setState({albumsPerRequest: 500});

                    // advance counter and move on to the next album anyway
                    nextIndex += albumsJustYears.length;
                    var remainingAlbums = _this.state.albums.slice(nextIndex, _this.state.albums.length);

                    //if remainingAlbums length is larger than 0, run getAllReleaseYears again with this.state.albums array as argument
                    if (remainingAlbums.length > 0) {
                        _this.getAllReleaseYears(remainingAlbums, nextIndex);
                    }
                    //else, we have completely processed all albums now
                    //loop through each album in albumsWithYears array and run sortAlbum on each one
                    else {
                        //call sortAlbum for each album in the array
                        for (var i=0; i<_this.state.albums.length; i++) {
                            _this.sortAlbum(_this.state.albums[_this.state.albumCounter]);
                        }
                    }

                }
            });
    },

    sortAlbum: function (album) {
        var newYears = this.state.years;

        // 1) if this album has no release year, do nothing
        if (album.releaseYear == -1 || album.releaseYear < 1900) {
            //console.log("couldn't find a year for the album " + album.name);
        } else if (album.releaseYear < this.state.earliestYear) {
            // 2) check if this albums release year is earlier than the current earliest year
            // 3) if it is, then for all years between the current earliest year and this albums release year
            for (var i=this.state.earliestYear-1; i>=album.releaseYear; i--) {
                // make a new year object
                var yearObj = {
                    yearNumber: i,
                    releasedAlbums: [],
                    totalScrobbles: 0
                };
                // 3a) when you make the year object for this album's release year, add the album to it
                if (i == album.releaseYear) {
                    yearObj.releasedAlbums.push(album);
                    yearObj.totalScrobbles += parseInt(album.playcount);
                }
                // 3b) if newly added album has higher total scrobbles than current topReleaseCount, set tRC to yearObj.totalScrobbles
                if (yearObj.totalScrobbles > this.state.topReleaseCount) {
                    this.setState({topReleaseCount: yearObj.totalScrobbles});
                }

                newYears.push(yearObj);
            }

            // now make this album's release year the earliest year
            this.setState({earliestYear: album.releaseYear});
        } else {
            // 4) otherwise (aka this albums release year is later than earliestYear)
            //      iterate through existing year state array, add album to correct year
            for (var i=0; i<newYears.length; i++) {
                if (newYears[i].yearNumber == album.releaseYear) {
                    newYears[i].releasedAlbums.push(album);
                    newYears[i].totalScrobbles += parseInt(album.playcount);

                    if (newYears[i].totalScrobbles > this.state.topReleaseCount) {
                        this.setState({topReleaseCount: newYears[i].totalScrobbles});
                    }
                }
            }
        }

        // 5) update the year array state
        this.setState({years: newYears});

        // 6) increment the counter
        var newCount = this.state.albumCounter + 1;
        this.setState({albumCounter: newCount});

        // 7) if the counter equals the albums array state length
        if (this.state.albumCounter == this.state.albums.length) {
            // 8) then we are done sorting the albums into years. show profile now.
            this.setTickmarks();
            this.props.showProfile(this.props.username, this.state.playcount, this.state.topReleaseCount, this.state.topTick, this.state.tickmarks, this.state.years, this.state.albums);
        //} else {
            // 9) otherwise (aka counter is larger than/equal to the albums array length)
            // 10) then we are done sorting the albums into years. show profile now.
           // this.setTickmarks();
            //this.props.showProfile(this.props.username, this.state.playcount, this.state.topReleaseCount, this.state.topTick, this.state.tickmarks, this.state.years, this.state.albums);
        }
    },

    setTickmarks: function () {
        var top = this.state.topReleaseCount;
        var exponent = top.toString().length - 1;
        var tickDivisions = [Math.pow(10, exponent-1), 5 * Math.pow(10, exponent-1), Math.pow(10, exponent), 2.5 * Math.pow(10, exponent)];
        var possibleTickCounts = [Math.ceil(top/tickDivisions[0]), Math.ceil(top/tickDivisions[1]), Math.ceil(top/tickDivisions[2]), Math.ceil(top/tickDivisions[3])];
        var totalTicksNeeded = possibleTickCounts[0];
        var finalTickDivision = tickDivisions[0];

        var idealTickNumber = 0;

        if (matchMedia) {
            var mq = window.matchMedia( "(max-width: 768px)" );
            mq.addListener(WidthChange);
            WidthChange(mq);
        }

        // media query change
        function WidthChange(mq) {
            if (mq.matches) {
                idealTickNumber = 3;
            } else {
                idealTickNumber = 10;
            }
        }

        for (var i=0; i<tickDivisions.length; i++) {
            if (Math.abs(possibleTickCounts[i] - idealTickNumber) < Math.abs(totalTicksNeeded - idealTickNumber)) {
                totalTicksNeeded = possibleTickCounts[i];
                finalTickDivision = tickDivisions[i];
            }
        }

        var tempTicks = [];
        for (var j=0; j<totalTicksNeeded; j++) {
            tempTicks[j] = finalTickDivision * j;
        }

        this.setState({
            topTick: finalTickDivision * totalTicksNeeded,
            tickmarks: tempTicks
        });
    },

    render: function () {
        return (
            <div id="loadingContainer">
                <div id="tunetraq-animated-logo">
                    <div id="tunetraq-logo-outer-curve">
                        <div id="tunetraq-logo-inner-curve"></div>
                        <div id="tunetraq-logo-block"></div>
                    </div>
                    <div id="tunetraq-logo-moving-parts-container">
                        <div id="tunetraq-logo-left-ear"></div>
                        <div id="tunetraq-logo-left-bar"></div>
                        <div id="tunetraq-logo-center-bar"></div>
                        <div id="tunetraq-logo-right-bar"></div>
                        <div id="tunetraq-logo-right-ear"></div>
                    </div>
                </div>

                <div id="loading-text">analyzing your tunes</div>
            </div>
        );
    }
});

var Profile = React.createClass({
    getInitialState: function () {
        document.getElementById("display").style.opacity = "0";
        document.getElementById("display").style.opacity = "1";
        return {
            showDetail: false
        };
    },

    changeDetail: function (year, count, albums, leaving) {

        if (leaving) {

            var _this = this;

            document.getElementById("detailTransparent").style.opacity = "1";
            document.getElementById("detailContainer").style.opacity = "1";
            document.getElementById("detailTransparent").style.opacity = "0";
            document.getElementById("detailContainer").style.opacity = "0";

            setTimeout(function() {

                afterFade(year, count, albums, _this);
            }, 300);

            var afterFade = function (year, count, albums, _this) {
                _this.setState({
                    year: year,
                    count: count,
                    albums: albums,
                    showDetail: !_this.state.showDetail
                });
            };
        } else {
            this.setState({
                year: year,
                count: count,
                albums: albums,
                showDetail: !this.state.showDetail
            });
        }
    },

    render: function () {
        if (!this.state.showDetail) {
            return (
                <div className="profile">
                    <TimelineHeader years={this.props.years} username={this.props.username} playcount={this.props.playcount}/>
                    <Timeline changeDetail={this.changeDetail}
                              years={this.props.years}
                              option={this.props.option}
                              topScrobbles={this.props.topScrobbles}
                              topTick={this.props.topTick}
                              tickmarks={this.props.tickmarks}/>
                    <TimelineFooter/>
                </div>
            );
        }
        else {
            return (
                <div className="profile">
                    <TimelineHeader years={this.props.years} username={this.props.username} playcount={this.props.playcount}/>
                    <Timeline changeDetail={this.changeDetail}
                              years={this.props.years}
                              option={this.props.option}
                              topScrobbles={this.props.topScrobbles}
                              topTick={this.props.topTick}
                              tickmarks={this.props.tickmarks}/>
                    <TimelineFooter/>
                    <YearDetail year={this.state.year} count={this.state.count} albums={this.state.albums} goBack={this.changeDetail} option={this.props.option}/>
                </div>
            );
        }
    }
});

var TimelineHeader = React.createClass({
    getInitialState: function() {
        return {
            topYear: {
                year: 0,
                scrobbles: 0
            }
        };
    },

    getTopYear: function () {
        var yr = this.state.topYear;
        var allYears = this.props.years;
        for (var i=0; i<allYears.length; i++) {
            if (allYears[i].totalScrobbles > yr.scrobbles) {
                yr = {
                    year: allYears[i].yearNumber,
                    scrobbles: allYears[i].totalScrobbles
                }
            }
        }
        this.setState({topYear: yr});
    },

    componentWillMount: function() {
        this.getTopYear();
    },

    render: function () {
        return (
            <div className="timelineHeader container-fluid">
                <div className="col-sm-2 col-xs-3">
                    <a id="logoLink" href="https://tunetraq.me">
                        <img id="timelineLogo" src="tunetraq_logo.png"/>
                        <div id="logoText">tunetraq</div>
                    </a>
                </div>
                <div className="col-sm-8 col-xs-9" id="userInfo">
                    <h2 id="userTitle"><strong>{this.props.username}'s Timeline</strong></h2>
                </div>
                <div className="col-sm-2">
                    <h4 id="playcount"><strong>Total Scrobbles</strong><br/>{this.props.playcount}</h4>
                    <h4 id="topYear"><strong>Top Year</strong><br/>{this.state.topYear.year}</h4>
                </div>
            </div>
        );
    }
});

var Timeline = React.createClass({
    render: function () {
        var self = this;

        var firstTimelineStyle = {
            "margin-top": "1em",
            "position": "absolute"
        };

        var secondTimelineStyle = {
            "padding-top": 3 + "em",
            "height": this.props.years.length * 2.75 + 8 + "em"
        };

        var noCountStyle = {
            zIndex: -1,
            "padding-top": "1em"
        }

        return (
            <div>
                <div className="timelineContainer" style={firstTimelineStyle}>
                    <div id="timelineTitle">
                        Distribution of total scrobbles for {this.props.option}, sorted by release year
                    </div>
                    <div className="axisBar" style={noCountStyle}>
                        <Axis topTick={this.props.topTick} tickmarks={this.props.tickmarks} years={this.props.years} hasCount={false}/>
                    </div>
                    <div id="timeline">
                        {this.props.years.map(function(year, index) {
                            return (
                                <Segment key={index} year={year.yearNumber}
                                         changeDetail={this.props.changeDetail}
                                         releasedAlbums={year.releasedAlbums}
                                         count={year.totalScrobbles}
                                         topScrobbles={self.props.topScrobbles}
                                         topTick={self.props.topTick}/>
                            );
                        }, this)}
                    </div>
                </div>
                <div className="timelineContainer" style={secondTimelineStyle}>
                    <div className="axisBar barWithTicks">
                        <Axis topTick={this.props.topTick} tickmarks={this.props.tickmarks} years={this.props.years} hasCount={true}/>
                    </div>
                </div>
            </div>
        );
    }

});

var TimelineFooter = React.createClass({
    render: function () {
        return(
            <div className="timelineFooter">
                <h5 id="portfolioLink"><a href="http://mgarcia.me">mgarcia.me</a></h5>
                <h6 id="copyright">© Michael Garcia 2018</h6>
            </div>
        );
    }
    //<h5 id="portfolioLink"><a href="../public_html/index.html">mgarcia.me</a></h5>
    //<h5 id="portfolioLink"><a href="../../Documents/web_projects/portfolio_site/index.html">mgarcia.me</a></h5>
    //<h5 id="portfolioLink"><a href="http://mgarcia.me">mgarcia.me</a></h5>
});

var Axis = React.createClass({
    render: function () {
        var self = this;

        return (
            <div className="axis">
                <div className="axisAfterPadding">
                    {this.props.tickmarks.map(function(tick, index) {
                        return (
                            <Tick key={index} tickNumber={tick} years={self.props.years} hasCount={self.props.hasCount}/>
                        );
                    })}
                </div>
            </div>
        );
    }
});

var Tick = React.createClass({
    render: function () {

        var noCountStyle = {
            "border-left": "1px solid #777777"
        }

        if (this.props.hasCount) {
            return (
                <div className="tick">
                    <p className="tickNumberWrapper">
                        <p className="tickNumber">{this.props.tickNumber}</p>
                    </p>
                </div>
            );
        } else {
            return (
                <div className="tick" style={noCountStyle}>
                </div>
            );
        }
    }
});

var Segment = React.createClass({
    handleClick: function () {
        this.props.changeDetail(this.props.year, this.props.count, this.props.releasedAlbums, false);
    },

    render: function () {
        return (
            <div onClick={this.handleClick} className="segment container-fluid">
                <Year year={this.props.year} albums={this.props.releasedAlbums} count={this.props.count}/>
                <Releases count={this.props.count} topScrobbles={this.props.topScrobbles} topTick={this.props.topTick}/>
            </div>
        );
    }
});

var Year = React.createClass({
    render: function () {
        return (
            <div className="bar year">{this.props.year}</div>
        );
    }
});

var Releases = React.createClass({
    render: function () {
        var setWidthStyle = {
            width: this.props.count / this.props.topTick * 85 + "%"
        };

        return (
            <div style={setWidthStyle} className="bar releases">{this.props.count}</div>
        );
    }
});

var YearDetail = React.createClass({

    handleClick: function (event) {
        this.props.goBack(this.props.year, this.props.count, this.props.releasedAlbums, true);
    },

    handleClickPreventDefault: function (event) {
        //this.props.goBack(this.props.year, this.props.count, this.props.releasedAlbums, true);
        event.preventDefault();
    },

    truncateAlbums: function () {
        var albumsLength = this.props.albums.length;
        if (albumsLength < 1) {
            this.setState({
                noAlbums: true
            });
        } else {
            var topAlbums = [];
            for(var i=0; i<Math.min(albumsLength, 5); i++) {
                topAlbums.push(this.props.albums[i]);
            }
            this.setState({topAlbums: topAlbums});
        }

    },

    componentWillMount: function () {
        this.truncateAlbums();
    },


    componentDidMount: function () {
        document.getElementById("detailTransparent").style.opacity = "1";
        document.getElementById("detailContainer").style.opacity = "1";
    },

    render: function() {
        if (this.props.year == 0) {
            return(
                <div></div>
            );
        }
        else if (!this.state.noAlbums) {
            return (
                <div id="detailBackground">
                    <div id="detailTransparent" onClick={this.handleClick}></div>
                    <div id="detailContainer" className="container-fluid">
                        <div className="detailHeader row">
                            <h1 className="detailYearText col-sm-2">{this.props.year}</h1>
                            <h2 className="detailScrobbleCount col-sm-7 col-sm-offset-3"><strong>{this.props.count}</strong> total scrobbles </h2>
                        </div>
                        <div className="albumContainer row">
                            {this.state.topAlbums.map(function(album, index) {
                                return (
                                    <Album key={index} imageurl={album.image[2]['#text']} artist={album.artist.name} name={album.name} playcount={album.playcount}/>
                                );
                            })}
                        </div>
                        <button className="detailButton" onClick={this.handleClick}>X</button>
                    </div>
                </div>
            );
        } else {
            return (
                <div id="detailBackground">
                    <div id="detailTransparent" onClick={this.handleClick}></div>
                    <div id="detailContainer" className="container-fluid">
                        <div className="detailHeader row">
                            <h1 className="detailYearText col-sm-2">{this.props.year}</h1>
                            <h3 className="detailScrobbleCount col-sm-7 col-sm-offset-3" >
                                none of the albums from {this.props.option} were released in this year.
                            </h3>
                        </div>
                        <button className="detailButton" onClick={this.handleClick}>X</button>
                    </div>
                </div>
            );
        }
    }
});

var Album = React.createClass({
    render: function () {
        return(
            <div className="album col-sm-2 col-sm-push-1">
                <img className="albumCover" src={this.props.imageurl}/>
                <h4><strong>{this.props.artist}</strong><br/>{this.props.name}</h4>
                <h5>{this.props.playcount} scrobbles</h5>
            </div>
        );
    }
});

ReactDOM.render(<Display/>, document.getElementById('main-container'));