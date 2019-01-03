<?php
    $albums = $_POST['albums'];

    $result = [];

    $count = 0;

    // db setup

    // for testing
    $dbhost = 'localhost';
    $dbuser = 'root';
    $dbpass = '';
    //$dbname = 'test_db';
    $dbname = 'discogs_dump';

    // for prod
    //$dbhost = 'localhost';
    //$dbuser = 'mgarjkuz_user';
    //$dbpass = 'mgarjkuz(pass)';
    //$dbname = 'mgarjkuz_discogs_dump';

    $conn = new mysqli($dbhost, $dbuser, $dbpass, $dbname);

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    foreach ($albums as $album) {

        // get the artist and release title
        $artist = $album["artist"];
        $release_title = $album["releaseTitle"];

        // use those to get the release year
        $artist_first_char = strtolower(substr($artist, 0 , 1));
        if (!ctype_alnum($artist_first_char)) {$artist_first_char = "other";}
        $table_name = "artist_" . $artist_first_char;

        $res = mysqli_query($conn,"SELECT `release_year` FROM `" . $table_name .
            "` WHERE `artist` LIKE '" . addslashes($artist) . "' AND `title` LIKE '" . addslashes($release_title) . "' ORDER BY id LIMIT 1;");
        $row = $res->fetch_array(MYSQLI_NUM);

        // add the release year to the album element
        $album['releaseYear'] = $row[0];

        // add the album to the result array
        $result[] = $album;

        $count = $count + 1;
    }

    $conn->close();

    echo json_encode($result);
?>