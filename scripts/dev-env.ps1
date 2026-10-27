# Use JDK 21 for THIS terminal session only (global JAVA_HOME stays untouched).
# Usage (note the leading dot): . .\scripts\dev-env.ps1
# Path is the JDK bundled with Android Studio on the developer's machine; change it if the JDK moves.
$jdk = "D:\Softwares\Android Studio\jbr"
if (-not (Test-Path "$jdk\bin\javac.exe")) { Write-Error "JDK not found at $jdk"; return }
$env:JAVA_HOME = $jdk
$env:Path = "$jdk\bin;$env:Path"
java -version
