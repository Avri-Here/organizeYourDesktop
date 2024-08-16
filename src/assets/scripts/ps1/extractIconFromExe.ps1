


[CmdletBinding(SupportsShouldProcess)]
Param()

# Set the path to the executable from the environment variable

# Set the destination directory for saving the icon


$UserProfilePath = [System.Environment]::GetFolderPath("UserProfile")
Write-Output $UserProfilePath

$Path = $env:EXE_PATH

$Destination = $UserProfilePath + "\organizeYourDesktop\img\exe"

$Format = "png"

Write-Verbose "Starting $($MyInvocation.MyCommand)"

Try {
    Add-Type -AssemblyName System.Drawing -ErrorAction Stop
}
Catch {
    Write-Warning "Failed to import System.Drawing"
    Throw $_
}

# Determine the image format
Switch ($Format) {
    "ico" {$ImageFormat = "icon"}
    "bmp" {$ImageFormat = "Bmp"}
    "png" {$ImageFormat = "Png"}
    "jpg" {$ImageFormat = "Jpeg"}
    "gif" {$ImageFormat = "Gif"}
}

$file = Get-Item $Path
# $Path = $env:EXE_PATH

Write-Verbose "Processing $($file.FullName)"

# Convert destination to file system path
$Destination = Convert-Path -Path $Destination

# Use the executable's base name as the image file name
$base = $file.BaseName

# Construct the image file name
$out = Join-Path -Path $Destination -ChildPath "$base.$Format"

Write-Verbose "Extracting $ImageFormat image to $out"
$ico =  [System.Drawing.Icon]::ExtractAssociatedIcon($file.FullName)

if ($ico) {
    if ($PSCmdlet.ShouldProcess($out, "Extract icon")) {
        $ico.ToBitmap().Save($out, $ImageFormat)
        Get-Item -Path $out
    }
}
else {
    Write-Warning "No associated icon image found in $($file.FullName)"
}

Write-Verbose "Ending $($MyInvocation.MyCommand)"








































# param (
#     $arg1,
#     $arg2
# )

# # Access the environment variables
# $myEnvVar = $env:MY_ENV_VAR
# $anotherVar = $env:ANOTHER_VAR

# Write-Output "Argument 1: $arg1"
# Write-Output "Argument 2: $arg2"
# Write-Output "Environment Variable MY_ENV_VAR: $myEnvVar"
# Write-Output "Environment Variable ANOTHER_VAR: $anotherVar"
