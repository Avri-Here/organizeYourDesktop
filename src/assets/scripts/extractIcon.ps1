param (
    [string]$exePath,
    [string]$savePath
)

# Load the System.Drawing assembly
Add-Type -AssemblyName System.Drawing

# Load the .exe file
$icon = [System.Drawing.Icon]::ExtractAssociatedIcon($exePath)

# Save the icon to the specified path as a .png
$bitmap = $icon.ToBitmap()
$bitmap.Save($savePath, [System.Drawing.Imaging.ImageFormat]::Png)
