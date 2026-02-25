const form = document.getElementById('idea-form')
const promptInput = document.getElementById('prompt')
const resultEl = document.getElementById('result')
const outputEl = document.getElementById('idea-output')
const loader = document.getElementById('loader')
const heroBg = document.getElementById('heroBg')

function showLoader(show) {
	if (show) {
		loader.style.display = 'block'
		outputEl.style.display = 'none'
		resultEl.classList.remove('hidden')
		// hide any previous reveal animation
		resultEl.classList.remove('show')
	} else {
		loader.style.display = 'none'
		outputEl.style.display = 'block'
	}
}

// Parallax / subtle movement for hero background
;(function setupParallax(){
	if (!heroBg) return
	let mx = 0, my = 0, tx = 0, ty = 0
	const speed = 0.08
	function onMove(e){
		const rect = heroBg.getBoundingClientRect()
		const cx = rect.left + rect.width/2
		const cy = rect.top + rect.height/2
		const clientX = e.clientX || (e.touches && e.touches[0].clientX) || cx
		const clientY = e.clientY || (e.touches && e.touches[0].clientY) || cy
		mx = (clientX - cx) / rect.width * 20
		my = (clientY - cy) / rect.height * 12
	}
	function tick(){
		tx += (mx - tx) * speed
		ty += (my - ty) * speed
		heroBg.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(1.02)`
		requestAnimationFrame(tick)
	}
	window.addEventListener('mousemove', onMove, {passive:true})
	window.addEventListener('touchmove', onMove, {passive:true})
	tick()
})()

form.addEventListener('submit', async (e) => {
	e.preventDefault()
	const prompt = promptInput.value.trim()
	if (!prompt) return

	showLoader(true)

	try {
		const res = await fetch('/generate', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ customPrompt: prompt })
		})
		const data = await res.json()
		if (!data.success) throw new Error(data.error || 'Generation failed')

		// Render idea (preserve newlines)
		outputEl.innerHTML = `<pre class="idea-pre">${escapeHtml(data.idea)}</pre>`
		// trigger reveal animation
		requestAnimationFrame(()=> resultEl.classList.add('show'))
	} catch (err) {
		outputEl.innerHTML = `<div class="error">${escapeHtml(String(err))}</div>`
	} finally {
		showLoader(false)
	}
})

function escapeHtml(text) {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;')
}
