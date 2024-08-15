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


# param (
#     [string]$exePath,
#     [string]$savePath
# )

# # Load the System.Drawing assembly
# Add-Type -AssemblyName System.Drawing

# # Load the .exe file
# $icon = [System.Drawing.Icon]::ExtractAssociatedIcon($exePath)

# if ($icon -ne $null) {
#     # Save the icon to the specified path as a .png
#     try {
#         $bitmap = $icon.ToBitmap()
#         $bitmap.Save($savePath, [System.Drawing.Imaging.ImageFormat]::Png)
#         Write-Output "Icon saved successfully to $savePath"
#     } catch {
#         Write-Error "Failed to save the icon: $_"
#     }
# } else {
#     Write-Error "No icon found in the executable."
# }
