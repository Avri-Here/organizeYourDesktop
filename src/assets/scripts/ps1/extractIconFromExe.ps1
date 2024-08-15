



[CmdletBinding(SupportsShouldProcess)]
Param(

    [string]$Path,
    [string]$Destination = ".",
    [string]$Name,
    [string]$Format = "png"
    )
    #$Path = "C:\Program Files\AutoHotkey\UX\AutoHotkeyUX.exe"
    $Destination = "C:\Users\avrahamy\organizeYourDesktop\img"

    Write-Verbose "Starting $($MyInvocation.MyCommand)"

    Try {
        Add-Type -AssemblyName System.Drawing -ErrorAction Stop
    }
    Catch {
        Write-Warning "Failed to import System.Drawing"
        Throw $_
    }

    Switch ($format) {
        "ico" {$ImageFormat = "icon"}
        "bmp" {$ImageFormat = "Bmp"}
        "png" {$ImageFormat = "Png"}
        "jpg" {$ImageFormat = "Jpeg"}
        "gif" {$ImageFormat = "Gif"}
    }

    $file = Get-Item $path
    Write-Verbose "Processing $($file.fullname)"
    #convert destination to file system path
    $Destination = Convert-Path -path $Destination

    if ($Name) {
        $base = $Name
    }
    else {
        $base = $file.BaseName
    }

    #construct the image file name
    $out = Join-Path -Path $Destination -ChildPath "$base.$format"

    Write-Verbose "Extracting $ImageFormat image to $out"
    $ico =  [System.Drawing.Icon]::ExtractAssociatedIcon($file.FullName)

    if ($ico) {
        #WhatIf (target, action)
        if ($PSCmdlet.ShouldProcess($out, "Extract icon")) {
            $ico.ToBitmap().Save($Out,$Imageformat)
            Get-Item -path $out
        }
    }
    else {
        #this should probably never get called
        Write-Warning "No associated icon image found in $($file.fullname)"
    }

    Write-Verbose "Ending $($MyInvocation.MyCommand)"