@props(['url'])
<tr>
<td class="header">
<a href="{{ $url }}" style="display: inline-block;">
@if (trim($slot) === 'Laravel')
<img src="{{ config('app.url') }}/logo.svg" class="logo" alt="UniEspaços Logo">
@else
{{ $slot }}
@endif
</a>
</td>
</tr>
