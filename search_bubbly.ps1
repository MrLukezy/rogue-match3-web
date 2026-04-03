$content = Get-Content $env:TEMP\mixkit2.html -Raw
$idx = $content.ToLower().IndexOf('bubbly')
if ($idx -gt 0) {
    $searchArea = $content.Substring([Math]::Max(0, $idx - 2000), 2500)
    if ($searchArea -match 'data-audio-player-item-id-value="(\d+)"') {
        Write-Host "Found item ID near bubbly: $($matches[1])"
    }
    if ($searchArea -match 'data-audio-player-preview-url-value="([^"]+)"') {
        Write-Host "Preview URL: $($matches[1])"
    }
    # Show context
    Write-Host "Context: $($searchArea.Substring(0, [Math]::Min(500, $searchArea.Length)))"
} else {
    Write-Host "bubbly not found in page"
}
