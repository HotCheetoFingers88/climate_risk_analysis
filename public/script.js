        const API = '/api/analyze';
        let charts = {};

        // ── Sample data table (loaded from JSON, not hardcoded HTML) ──
        async function loadSampleTable() {
            try {
                const res = await fetch('sample-data.json');
                const { columns, rows } = await res.json();
                const labels = ['Year', 'Temperature (°C)', 'Precipitation (mm)', 'RiskScore'];
                let html = '<tr>' + labels.map(l => `<th>${l}</th>`).join('') + '</tr>';
                rows.forEach(row => {
                    html += '<tr>' + row.map(v => `<td>${v}</td>`).join('') + '</tr>';
                });
                document.getElementById('sampleTable').innerHTML = html;
            } catch (err) {
                document.getElementById('sampleTable').innerHTML = '<tr><td>Could not load sample data.</td></tr>';
            }
        }
        loadSampleTable();

        // ── Tab switching ──
        function switchTab(tab) {
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
            document.getElementById('panel' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('active');
            const tabs = ['sample', 'analyze', 'glossary'];
            document.querySelectorAll('.nav-tab')[tabs.indexOf(tab)].classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // ── Chart defaults ──
        Chart.defaults.color = '#6b7fa3';
        Chart.defaults.borderColor = '#1e2e4a';
        Chart.defaults.font.family = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

        function destroyCharts() { Object.values(charts).forEach(c => c.destroy()); charts = {}; }

        // ── Status ──
        function showStatus(msg, type) {
            const el = document.getElementById('status');
            el.style.display = 'block'; el.className = type;
            el.innerHTML = type === 'loading' ? `<span class="spinner"></span>${msg}` : msg;
        }
        function hideStatus() { document.getElementById('status').style.display = 'none'; }

        // ── File drop ──
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        dropZone.addEventListener('click', () => fileInput.click());
        dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
        dropZone.addEventListener('drop', e => {
            e.preventDefault(); dropZone.classList.remove('dragover');
            const file = e.dataTransfer.files[0]; if (file) handleFile(file);
        });
        fileInput.addEventListener('change', () => { if (fileInput.files[0]) handleFile(fileInput.files[0]); });

        function handleFile(file) {
            document.getElementById('fileName').textContent = file.name;
            const reader = new FileReader();
            reader.onload = e => runAnalysis(e.target.result);
            reader.readAsText(file);
        }
        document.getElementById('sampleBtn').addEventListener('click', () => {
            document.getElementById('fileName').textContent = 'sample_data.csv';
            runAnalysis(null);
        });

        // ── Core fetch ──
        async function runAnalysis(csvText) {
            showStatus('Running analysis…', 'loading');
            destroyCharts();
            document.getElementById('results').style.display = 'none';
            try {
                const opts = csvText
                    ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ csv: csvText }) }
                    : { method: 'GET' };
                const res = await fetch(API, opts);
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Analysis failed');
                hideStatus();
                renderResults(data);
            } catch (err) {
                showStatus('⚠ ' + err.message, 'error');
            }
        }

        // ── Render ──
        function renderResults(d) {
            const s = d.stats;
            const r2class = s.r2 >= 0.85 ? '' : s.r2 >= 0.6 ? 'warn' : 'danger';
            const r2label = s.r2 >= 0.85 ? '✓ Strong fit' : s.r2 >= 0.6 ? '~ Moderate fit' : '✗ Weak fit';

            document.getElementById('statsGrid').innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Data Points</div>
      <div class="stat-value">${s.n}</div>
      <div class="stat-sub">${s.n_anomalies} anomalies found</div>
      <div class="stat-hint">Number of valid rows used in the model. More data = more reliable results.</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Mean Risk</div>
      <div class="stat-value">${s.mean}</div>
      <div class="stat-sub">σ = ${s.std}</div>
      <div class="stat-hint">Average RiskScore across all years. σ shows how much it varies.</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Median Risk</div>
      <div class="stat-value">${s.median}</div>
      <div class="stat-sub">Middle value</div>
      <div class="stat-hint">Half of years fall above this, half below. Less affected by extreme years than the mean.</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">R² Score</div>
      <div class="stat-value ${r2class}">${s.r2}</div>
      <div class="stat-sub">${r2label}</div>
      <div class="stat-hint">How much of the risk variation Temp + Precip explain. 1.0 = perfect, 0 = useless.</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">MSE</div>
      <div class="stat-value">${s.mse}</div>
      <div class="stat-sub">Mean Squared Error</div>
      <div class="stat-hint">Average squared prediction error. Lower is better. Compare across runs, not in isolation.</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Anomalies</div>
      <div class="stat-value ${s.n_anomalies > 0 ? 'danger' : ''}">${s.n_anomalies}</div>
      <div class="stat-sub">Beyond 2σ from mean</div>
      <div class="stat-hint">Years with unusually high or low risk. Could be real events or data errors — worth investigating.</div>
    </div>
  `;

            const sign = v => v >= 0 ? '+' : '−';
            const absB1 = Math.abs(s.b1_temp), absB2 = Math.abs(s.b2_precip);
            document.getElementById('equation').textContent =
                `RiskScore = ${s.b0} ${sign(s.b1_temp)} ${absB1} × Temperature ${sign(s.b2_precip)} ${absB2} × Precipitation`;

            document.getElementById('modelExplain').innerHTML =
                `Each extra <strong style="color:var(--text)">1°C</strong> of temperature is associated with a risk change of <strong style="color:var(--accent)">${s.b1_temp > 0 ? '+' : ''}${s.b1_temp}</strong> points. ` +
                `Each extra <strong style="color:var(--text)">1mm</strong> of precipitation is associated with a change of <strong style="color:var(--accent)">${s.b2_precip > 0 ? '+' : ''}${s.b2_precip}</strong> points. ` +
                `The model explains <strong style="color:var(--accent)">${(s.r2 * 100).toFixed(1)}%</strong> of the variation in RiskScore.`;

            document.getElementById('corrRow').innerHTML = `
    <div class="corr-item">Temp ↔ Risk correlation: <strong>${s.temp_risk_corr}</strong></div>
    <div class="corr-item">Precip ↔ Risk correlation: <strong>${s.precip_risk_corr}</strong></div>
  `;

            const anomalyColors = d.actual_risk.map((_, i) =>
                d.anomalies[i] ? 'rgba(255,107,107,1)' : 'rgba(0,201,167,0.85)'
            );
            charts.timeline = new Chart(document.getElementById('timelineChart'), {
                type: 'line',
                data: {
                    labels: d.years,
                    datasets: [
                        { label: 'Actual Risk', data: d.actual_risk, borderColor: 'rgba(0,201,167,0.9)', backgroundColor: 'rgba(0,201,167,0.07)', pointBackgroundColor: anomalyColors, pointRadius: 5, tension: 0.3, fill: true },
                        { label: 'Predicted Risk', data: d.predicted_risk, borderColor: 'rgba(255,209,102,0.9)', borderDash: [5, 4], pointRadius: 3, tension: 0.3, fill: false }
                    ]
                },
                options: chartOpts('Risk Score')
            });

            charts.temp = new Chart(document.getElementById('tempChart'), {
                type: 'scatter',
                data: {
                    datasets: [
                        { label: 'Actual', data: d.temperatures.map((t, i) => ({ x: t, y: d.actual_risk[i] })), backgroundColor: d.anomalies.map(a => a ? 'rgba(255,107,107,0.85)' : 'rgba(0,201,167,0.7)'), pointRadius: 6 },
                        { label: 'Predicted', data: d.temperatures.map((t, i) => ({ x: t, y: d.predicted_risk[i] })), backgroundColor: 'rgba(255,209,102,0.5)', pointRadius: 4 }
                    ]
                },
                options: chartOpts('Risk Score', 'Temperature (°C)')
            });

            charts.precip = new Chart(document.getElementById('precipChart'), {
                type: 'scatter',
                data: {
                    datasets: [
                        { label: 'Actual', data: d.precipitations.map((p, i) => ({ x: p, y: d.actual_risk[i] })), backgroundColor: d.anomalies.map(a => a ? 'rgba(255,107,107,0.85)' : 'rgba(0,201,167,0.7)'), pointRadius: 6 },
                        { label: 'Predicted', data: d.precipitations.map((p, i) => ({ x: p, y: d.predicted_risk[i] })), backgroundColor: 'rgba(255,209,102,0.5)', pointRadius: 4 }
                    ]
                },
                options: chartOpts('Risk Score', 'Precipitation (mm)')
            });

            let rows = '<tr><th>Year</th><th>Temp (°C)</th><th>Precip (mm)</th><th>Actual Risk</th><th>Predicted Risk</th><th>Δ Error</th><th>Flag</th></tr>';
            d.years.forEach((yr, i) => {
                const err = (d.actual_risk[i] - d.predicted_risk[i]).toFixed(3);
                const cls = d.anomalies[i] ? ' class="anomaly"' : '';
                rows += `<tr${cls}><td>${yr}</td><td>${d.temperatures[i]}</td><td>${d.precipitations[i]}</td><td>${d.actual_risk[i]}</td><td>${d.predicted_risk[i]}</td><td>${err}</td><td>${d.anomalies[i] ? '⚠ anomaly' : '—'}</td></tr>`;
            });
            document.getElementById('dataTable').innerHTML = rows;

            document.getElementById('results').style.display = 'block';
            document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        function chartOpts(yLabel, xLabel) {
            return {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { boxWidth: 12, font: { size: 11 } } },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                    x: { title: { display: !!xLabel, text: xLabel, color: '#6b7fa3' }, grid: { color: 'rgba(30,46,74,0.5)' } },
                    y: { title: { display: true, text: yLabel, color: '#6b7fa3' }, grid: { color: 'rgba(30,46,74,0.5)' } }
                }
            };
        }
