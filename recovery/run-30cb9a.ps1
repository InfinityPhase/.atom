# This script was written with the purpose of building the caris project and
# running her with the provided token. This can be hardcoded, but is not
# recommended. This script may require that the execution policy of powershell
# be altered with: set-executionpolicy remotesigned

<#
.SYNOPSIS
Starts the CARIS bot, with the provided token when run from the root directory.
.DESCRIPTION
Allows for easily testing caris, when still in development. It is required that
this script be run from the root directory of the project. This means that the
src folder should be present in this directory.
.PARAMETER TOKEN
The token that CARIS needs to connect to Discord.
.EXAMPLE
run -TOKEN tokenstring
.LINK
github.com/InfinityPhase/CARIS
#>

# Parameter declaration
param (
  [Parameter(Mandatory=$False)] # Perhaps this should be mandatory...
  [string]$TOKEN = ""
)

# Variable declarations
$GRADLE = "gradle"
$PROJECTNAME = Split-Path -Path $MyInvocation.MyCommand.Definition -Parent
$EXTENSION = ".zip"

if( $TOKEN == "" ) {
  # Not exit, as that will close the shell. Stops execution.
  Write-Host "No token was found, or given as a parameter. Please pass a token to the script."
  return
}

# Check if gradle is not in the path
if( ( Get-Command "gradlew.bat" -ErrorAction SilentlyContinue ) -eq $null )
{
   Write-Host "Unable to find pandoc.exe in your PATH"
}
