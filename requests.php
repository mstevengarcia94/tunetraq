<?php
    $curl = curl_init();
    $api_key = "api_key=d1c813cca7bcab3992fc2410fa012669";
    $token = "token=ACIpbTDVzqzaRjhAEmSUNzajFGuJHnFLSHVPflqc";
    $complete_url = "";
    $result = "";

    if ($_GET["type"] == "get_plays") {
        $method = "method=".$_GET["method"];
        $user = "user=".$_GET["user"];
        $format = "format=".$_GET["format"];
        
        $complete_url = "https://ws.audioscrobbler.com/2.0/?".$method."&".$user."&".$api_key."&".$format;
    }

    if ($_GET["type"] == "get_albums") {
        $method = "method=".$_GET["method"];
        $user = "user=".$_GET["user"];
        $format = "format=".$_GET["format"];
        $limit = "limit=".$_GET["limit"];
        $page = "page=".$_GET["page"];
        
        $complete_url = "https://ws.audioscrobbler.com/2.0/?".$method."&".$user."&".$limit."&".$page."&".$api_key."&".$format;
    }

    curl_setopt($curl, CURLOPT_URL, $complete_url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($curl, CURLOPT_USERAGENT, "tunetraq/1.0");
    $result = curl_exec($curl);
    curl_close($curl);

    echo $result;
?>