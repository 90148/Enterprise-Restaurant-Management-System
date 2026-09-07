@REM ----------------------------------------------------------------------------
@REM Maven Wrapper script for Windows
@REM ----------------------------------------------------------------------------
@echo off
setlocal

if "%JAVA_HOME%" == "" (
    if exist "C:\Program Files\Android\Android Studio\jbr\bin\java.exe" (
        set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
    )
)

if exist "C:\Users\surya\apache-maven-3.9.9\bin\mvn.cmd" (
    call "C:\Users\surya\apache-maven-3.9.9\bin\mvn.cmd" %*
) else (
    call mvn %*
)
