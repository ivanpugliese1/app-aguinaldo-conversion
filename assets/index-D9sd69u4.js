(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))a(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const r of s.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&a(r)}).observe(document,{childList:!0,subtree:!0});function n(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerPolicy&&(s.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?s.credentials="include":o.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function a(o){if(o.ep)return;o.ep=!0;const s=n(o);fetch(o.href,s)}})();const V="https://dolarapi.com/v1/dolares";async function R(){try{const e=await fetch(V);if(!e.ok)throw new Error(`Error HTTP: ${e.status}`);return await e.json()}catch(e){throw console.error("Error al obtener el valor del dolar",e),e}}function Y(e,t){return e/t}function z(e,t){return e*t}function k(e,t){if(!e||e===0)return null;const n=t-e,a=n/e*100;return{difference:n,percentageVariation:a,type:n>=0?"ascent":"descent"}}function _(e){const t={precio:e,date:new Date().toISOString()};localStorage.setItem("dollarPrices",JSON.stringify(t))}function J(){const e=localStorage.getItem("dollarPrices");return e?JSON.parse(e):null}async function O(e){const t=document.getElementById(e);if(!t){console.error(`Container ${e} no encontrado`);return}try{const n=await R(),a=J(),o=n.map(s=>{let r={purchase:null,sale:null};if(a&&a.precio){const i=a.precio.find(c=>c.casa===s.casa);i&&(r.purchase=k(i.compra,s.compra),r.sale=k(i.venta,s.venta))}return{...s,variation:r}});_(n),t.innerHTML=`
        <div class="header-prices">
          <h2>Cotizaciones USD</h2>
          <div>
            <span class="live-dot"></span>
            <span>EN VIVO</span>
          </div>
        </div>
        
        <div class="dollar-prices">
          ${o.map(s=>K(s)).join("")} 
        </div>
        <p class="last-update">
          Última actualización: ${new Date(n[0]?.fechaActualizacion||new Date).toLocaleString("es-AR")} 
        </p>
    `}catch{t.innerHTML='<p class="error">Error al cargar las cotizaciones del dólar. Por favor, intente nuevamente más tarde.</p>',document.getElementById("retry-prices")?.addEventListener("click",()=>{O(e)})}}function K(e){const t=e.nombre==="Contado con liquidación"?"CCL":e.nombre,n=a=>{if(!a)return"";const o=a.type==="ascent"?"positive-variation":"negative-variation",s=a.type==="ascent"?"▲":"▼";return`
      <span class="${o}">
        ${s} ${Math.abs(a.percentageVariation).toFixed(2)}%
      </span>
    `};return`
    <div class="dollar-card">
      <h3>Dolar ${t}</h3>
      
      <div class="values">
        <div class="purchase-value">
          <span class="price">$${e.compra.toFixed(2)}</span>
          <span class="purchase-text">Compra</span>
          ${n(e.variation?.purchase)}
        </div>
        <div class="sale-value">
          <span class="price">$${e.venta.toFixed(2)}</span>
          <span class="sale-text">Venta</span>
          ${n(e.variation?.sale)}
        </div>
      </div>
    </div>
  `}function F(e){let t=e.value.replace(/[^0-9,]/g,"");const n=t.split(",");n.length>2&&(t=n[0]+","+n.slice(1).join(""));let a=n[0].replace(/\D/g,""),o=n[1];a!==""&&(a=new Intl.NumberFormat("es-AR").format(parseInt(a,10))),e.value=o!==void 0?`${a},${o.slice(0,2)}`:a}let L=[];async function X(e){const t=document.getElementById(e);if(!t)return;try{L=await R()}catch{t.innerHTML='<p class="error">Error al cargar el conversor.</p>';return}t.innerHTML=`
    <div class="form-title">
      <h2>Conversor de Moneda</h2>
      <small>Conversión actualizada en tiempo real.</small>
    </div>

    <div class="form-groups-container">
      <div class="form-group">
        <label for="dollar-type">Seleccioná el tipo de Dólar :</label>
        <div class="custom-select-container" id="custom-select">
          <div class="select-selected">
            <span id="selected-text">Dólar Oficial</span>
            <span class="arrow"></span>
          </div>
          <div class="select-items select-hide">
            ${L.map(r=>`
              <div data-value="${r.casa}">
                Dólar ${r.nombre==="Contado con liquidación"?"CCL":r.nombre}
              </div>
            `).join("")}
          </div>
        </div>
        <select id="dollar-type" style="display:none">
            ${n()}
        </select>
      </div>

      <div class="conversor-wrapper">
        <div class="form-group">
            <label id="origin-label"><span>ARS</span></label>
            <input type="hidden" id="origin-currency" value="ARS">
        </div>
        
        <button id="btn-swap" class="btn-swap" title="Invertir monedas">
          ⇄
        </button>

        <div class="form-group">
            <label id="destination-label">USD</label>
            <input type="hidden" id="destination-currency" value="USD">
        </div>
      </div>

      <div class="form-group">
          <label for="amount">Monto :</label>
          <input type="text" id="amount" placeholder="$ 100.000" autocomplete="off">
      </div>
    </div>        
    <div id="conversion-result" class="conversion-result"></div>
  `,a();function n(){return L.map(r=>`<option value="${r.casa}">Dólar ${r.nombre==="Contado con liquidación"?"CCL":r.nombre}</option>`).join("")}function a(){const r=document.getElementById("amount"),i=document.getElementById("btn-swap"),c=document.getElementById("dollar-type"),u=document.getElementById("origin-currency"),l=document.getElementById("destination-currency"),d=document.getElementById("custom-select"),p=d.querySelector(".select-selected"),v=d.querySelector(".select-items");let g=!1;function E(m){g=!g,v.classList.toggle("select-hide")}p.addEventListener("click",()=>{v.classList.toggle("select-hide")}),p.addEventListener("touchend",m=>{m.preventDefault(),m.stopPropagation(),E()},{passive:!1}),v.querySelectorAll("div").forEach(m=>{function x(I){I.preventDefault(),I.stopPropagation();const W=I.target.getAttribute("data-value"),G=I.target.innerText,U=d.querySelector("#selected-text");U.innerText=G,c.value=W,v.classList.add("select-hide"),c.dispatchEvent(new Event("change"))}m.addEventListener("click",x),m.addEventListener("touchend",x,{passive:!1})});function T(m){!d.contains(m.target)&&g&&(g=!1,v.classList.add("select-hide"))}document.addEventListener("click",T),document.addEventListener("touchend",T),r.addEventListener("input",m=>{F(m.target),o()}),c.addEventListener("change",o);function B(m){m.preventDefault();const x=u.value;u.value=l.value,l.value=x,document.getElementById("origin-label").innerText=u.value,document.getElementById("destination-label").innerText=l.value,o()}i.addEventListener("click",B),i.addEventListener("touchend",m=>{m.preventDefault(),B(m)},{passive:!1})}function o(){const r=document.getElementById("amount").value,i=document.getElementById("origin-currency").value,c=document.getElementById("dollar-type").value,u=document.getElementById("conversion-result"),l=parseFloat(r.replace(/\./g,"").replace(",","."));if(isNaN(l)||l<=0){u.innerHTML="<small>Ingresá un monto para convertir.</small>";return}const d=L.find(E=>E.casa===c);if(!d)return;let p,v,g;i==="ARS"?(p=Y(l,d.venta),v=d.venta,g="venta"):(p=z(l,d.compra),v=d.compra,g="compra"),s(l,i,p,d,v,g)}function s(r,i,c,u,l,d){const p=document.getElementById("conversion-result"),v=i==="ARS"?"USD":"ARS",g=i==="ARS"?"$":"US$",E=v==="ARS"?"$":"US$";p.innerHTML=`
    <div class="conversion-result">
      <div class="conversion-visual">
        <div>
          <span>${g}${r.toLocaleString("es-AR")}</span>
        </div>
        <div> = </div>
        <div>
          <span>${E}${c.toLocaleString("es-AR")}</span>
        </div>
      </div>
      <div class="conversion-details">
        <small>1 USD = $${l.toFixed(2)} (${d}) / </small>
        <small>Dolar ${u.casa}</small>
      </div>
    </div>`}}function Q(e,t,n){if(!e||e<=0)throw new Error("El sueldo a ingresar debe ser mayor a 0");if(!(t instanceof Date)||isNaN(t))throw new Error("La fecha de ingreso no es válida, intente nuevamente.");if(!(n instanceof Date)||isNaN(n))throw new Error("La fecha de cálculo no es válida, intente nuevamente.");if(t>n)throw new Error("La fecha de ingreso no debe ser mayor a la fecha de cálculo, intente nuevamente.");const a=n.getMonth(),o=n.getFullYear();let s,r;a<6?(s=new Date(o,0,1),r=new Date(o,5,30)):(s=new Date(o,6,1),r=new Date(o,11,31));const i=t>s?t:s,c=Z(i,n),u=6,l=c.months+c.days/30,d=l/u,p=e/12*l;return{betterSalary:e,entryDate:t,dateCalculation:n,semester:a<6?1:2,startSemester:s,endSemester:r,effectiveStartDate:i,monthsWorked:c.months,daysWorked:c.days,monthsWorkedDecimal:parseFloat(l.toFixed(2)),proportion:parseFloat((d*100).toFixed(2)),bonusAmount:parseFloat(p.toFixed(2)),fullSemesterWork:l>=u}}function Z(e,t){let n=new Date(e),a=new Date(t),o=a.getFullYear()-n.getFullYear(),s=a.getMonth()-n.getMonth(),r=a.getDate()-n.getDate();if(r<0){s--;const c=new Date(a.getFullYear(),a.getMonth(),0);r+=c.getDate()}return s<0&&(o--,s+=12),{months:o*12+s,days:r}}function b(e){if(!e)return"N/A";const t=e instanceof Date?e:new Date(e);return isNaN(t.getTime())?(console.error("Fecha inválida recibida:",e),"Fecha error"):t.toLocaleDateString("es-AR",{day:"2-digit",month:"2-digit",year:"numeric"})}function ee(e){const t=document.getElementById(e),n=new Date,a=n.getMonth(),o=n.getFullYear();let s;a<6?s=new Date(o,5,30):s=new Date(o,11,31);const r=i=>i.toISOString().split("T")[0];t.innerHTML=`
    <form id="form-bonus" class="form-bonus">
        <div class="form-group">
          <label for="better-salary">
            Mejor sueldo bruto del semestre :
          </label>
          <input
            type="text"
            id="better-salary"
            name="better-salary"
            placeholder="$ 500.000"
            step="0.01"
            min="0"
            required
          >
          <small>Mejor sueldo bruto (antes de descuentos)</small>
        </div>

        <div class="form-group">
          <label for="entry-date">
            Fecha de ingreso al trabajo :
          </label>
          <input
            type="date"
            id="entry-date"
            name="entry-date"
            max="${r(n)}"
            required
          >
          <small>Si ingresaste antes del semestre actual, usá el inicio del semestre</small>
        </div>

        <div class="form-group">
          <label for="input-date">
            Fecha de liquidación del aguinaldo :
          </label>
          <input 
            type="date" 
            id="input-date" 
            name="input-date"
            value="${r(s)}"
            max="${r(new Date(o+1,11,31))}"
            required
          >
          <small>
            Primer semestre: 30/06 | Segundo semestre: 31/12
          </small>
        </div>


        <button type="submit" class="btn-primary">
          Calcular Aguinaldo
        </button>
    </form>
  `,setTimeout(()=>{te()},0)}function te(){const e=document.getElementById("form-bonus");document.getElementById("better-salary").addEventListener("input",n=>{F(n.target)}),e.addEventListener("submit",n=>{n.preventDefault(),ne()})}function ne(){const e=document.getElementById("better-salary").value,t=document.getElementById("entry-date").value,n=document.getElementById("input-date").value,a=parseFloat(e.replace(/\./g,"").replace(",","."));if(!a||isNaN(a)||a<=0||!t||!n){A("Debes completar todos los campos");return}const[o,s,r]=t.split("-").map(Number),[i,c,u]=n.split("-").map(Number),l=new Date(o,s-1,r),d=new Date(i,c-1,u);try{const p=Q(a,l,d);ae(p)}catch(p){A(p.message)}}function ae(e){const t=document.getElementById("bonus-result"),n=e.semester===1?"Primero ->":"Segundo ->";t.innerHTML=`
      <div class="calculation-details">
        <h3>Detalles del cálculo</h3>
        
        <div class="detail-group">
          <h4>Datos ingresados</h4>
          <div class="grid-detalles">
            <div class="item-detail">
              <span class="detail-text">Mejor sueldo :</span>
              <span class="value">$${e.betterSalary.toLocaleString("es-AR",{minimumFractionDigits:2})}</span>
            </div>
            <div class="item-detail">
              <span class="detail-text">Fecha de ingreso :</span>
              <span class="value">${b(e.entryDate)}</span>
            </div>
            <div class="item-detail">
              <span class="detail-text">Fecha de cálculo :</span>
              <span class="value">${b(e.dateCalculation)}</span>
            </div>
            <div class="item-detail">
              <span class="detail-text">Semestre :</span>
              <span class="value">${n} (${b(e.startSemester)} al ${b(e.endSemester)})</span>
            </div>
          </div>
        </div>

        <div class="detail-group">
          <h4>Tiempo trabajado</h4>
          <div class="grid-detalles">
            <div class="item-detail">
              <span class="detail-text">Desde :</span>
              <span class="value">${b(e.effectiveStartDate)}</span>
            </div>
            <div class="item-detail">
              <span class="detail-text">Hasta :</span>
              <span class="value">${b(e.dateCalculation)}</span>
            </div>
            <div class="item-detail">
              <span class="detail-text">Período trabajado :</span>
              <span class="value">${e.monthsWorked} ${e.monthsWorked===1?"mes":"meses"} y ${e.daysWorked} ${e.daysWorked===1?"día":"días"}</span>
            </div>
            <div class="item-detail">
              <span class="detail-text">Meses (decimal) :</span>
              <span class="value">${e.monthsWorkedDecimal} meses</span>
            </div>
          </div>
        </div>

        <div class="detail-group math-calculation">
          <h4>Cálculo matemático</h4>
          <div class="math-calculation-text">
            <p>- (Mejor sueldo / 12) * Meses trabajados</p>
            <p>
              - ($ ${e.betterSalary.toLocaleString("es-AR")} / 12) * ${e.monthsWorkedDecimal}
            </p>
            <p>
              - $ ${(e.betterSalary/12).toLocaleString("es-AR",{maximumFractionDigits:2})} * ${e.monthsWorkedDecimal}
            </p>
            <p>
              Aguinaldo = <strong>$ ${e.bonusAmount.toLocaleString("es-AR",{minimumFractionDigits:2})}</strong>
            </p>
          </div>
        </div>

        <div class="additional-info">
          <p>
            💡 <strong>Recordá:</strong> Este es el monto BRUTO de tu aguinaldo. 
            A este monto se le aplicarán los mismos descuentos que a tu sueldo mensual 
            (jubilación, obra social, etc.).
          </p>
        </div>
      </div>
  `}function A(e){const t=document.getElementById("bonus-result");t.innerHTML=`
    <div>
      <p>⚠️ ${e}</p>
    </div>
  `}const y={pension:.11,pami:.03,healthInsurance:.03,union:.02},H=28e5,q=28e4,j=[{from:0,to:28e5,rate:0,deduction:0},{from:28e5,to:42e5,rate:.05,deduction:14e4},{from:42e5,to:56e5,rate:.09,deduction:308e3},{from:56e5,to:7e6,rate:.12,deduction:476e3},{from:7e6,to:84e5,rate:.15,deduction:686e3},{from:84e5,to:1/0,rate:.27,deduction:1694e3}];function oe(e,t=!0,n=0){if(!e||e<=0)throw new Error("El sueldo bruto debe ser mayor a cero");if(n<0)throw new Error("Las personas a cargo no pueden ser negativas");const a=e*y.pension,o=e*y.pami,s=e*y.healthInsurance,r=t?e*y.union:0,i=se(e,n),c=a+o+s+r+i,u=e-c,l=c/e*100,d=u/e*100;return{grossSalary:parseFloat(e.toFixed(2)),hasUnion:t,dependentsCount:n,mandatoryDeductions:{pension:parseFloat(a.toFixed(2)),pensionPercentage:y.pension*100,pami:parseFloat(o.toFixed(2)),pamiPercentage:y.pami*100,healthInsurance:parseFloat(s.toFixed(2)),healthInsurancePercentage:y.healthInsurance*100,union:parseFloat(r.toFixed(2)),unionPercentage:t?y.union*100:0,incomeTax:parseFloat(i.toFixed(2)),incomeTaxDetail:i>0?re(e,n):null,total:parseFloat(c.toFixed(2))},totalDeductions:parseFloat(c.toFixed(2)),netSalary:parseFloat(u.toFixed(2)),deductionsPercentage:parseFloat(l.toFixed(2)),netPercentage:parseFloat(d.toFixed(2)),paysIncomeTax:i>0,minimumTaxableIncome:H}}function se(e,t){const n=t*q,a=Math.max(0,e-n);if(a<=H)return 0;const o=j.find(r=>a>=r.from&&a<r.to);if(!o)return 0;const s=a*o.rate-o.deduction;return Math.max(0,s)}function re(e,t){const n=t*q,a=Math.max(0,e-n),o=j.find(s=>a>=s.from&&a<s.to);return{taxableSalary:parseFloat(a.toFixed(2)),dependentsDeduction:parseFloat(n.toFixed(2)),appliedBracket:o?{rate:o.rate*100,deduction:o.deduction}:null}}function h(e){return e.toLocaleString("es-AR",{minimumFractionDigits:2,maximumFractionDigits:2})}function ie(e){const t=document.getElementById(e);if(!t){console.error(`Container ${e} not found`);return}t.innerHTML=ce(),setTimeout(()=>{le()},0)}function ce(){return`
      <form id="form-gross-to-net" class="salary-form">
        <div class="form-group">
          <label for="gross-salary">
            Ingresá tu Sueldo Bruto Mensual
          </label>
          <input
            type="text"
            id="gross-salary"
            name="gross-salary"
            placeholder="$ 500.000"
            step="0.01"
            min="0"
            required
            autocomplete="off"
          >
          <small>Sueldo antes de descuentos</small>
        </div>

        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input type="checkbox" id="has-union" checked>
            <span class="checkbox-text">
              ¿Estás sindicalizado? 
            </span>
          </label>
          <small>Descuento adicional del 2%</small>
        </div>

        <div class="form-group">
          <label for="dependents">
            Personas a cargo: 
          </label>
          <input 
            type="number" 
            id="dependents" 
            name="dependents"
            value="0" 
            min="0" 
            max="10"
            class="number-input"
          >
          <small>
            Hijos menores de edad y cónyuge (deducen Ganancias)
          </small>
        </div>

        <button type="submit" class="btn-primary">
          Calcular Sueldo Neto
        </button>
      </form>
  `}function le(){const e=document.getElementById("form-gross-to-net"),t=document.getElementById("gross-salary");if(!e){console.error("Formulario no encontrado");return}e.addEventListener("submit",n=>{n.preventDefault(),de()}),t.addEventListener("input",n=>{F(n.target)})}function de(){const e=document.getElementById("gross-salary").value,t=document.getElementById("has-union").checked,n=parseInt(document.getElementById("dependents").value),a=parseFloat(e.replace(/\./g,"").replace(",","."));if(!a||a<=0){M("result-gross-to-net","Por favor, ingresá un sueldo bruto válido mayor a cero");return}try{const o=oe(a,t,n);ue(o)}catch(o){M("result-gross-to-net",o.message)}}function ue(e){const t=document.getElementById("result-gross-to-net");t.innerHTML=`
    <div class="result-success">
        <div class="salary-flow">
          <div class="flow-item gross">
            <span class="flow-item-title">Sueldo Bruto : </span>
            <span class="amount">$${h(e.grossSalary)} / </span>
            <span class="percentage">100%</span>
          </div>

          <div class="flow-item deductions">
            <span class="flow-item-title">Descuentos : </span>
            <span class="amount negative">- $${h(e.totalDeductions)} / </span>
            <span class="percentage">${e.deductionsPercentage}%</span>
          </div>

          <div class="flow-item net">
            <span class="flow-item-title">Sueldo Neto : </span>
            <span class="amount highlighted">$${h(e.netSalary)} / </span>
            <span class="percentage">${e.netPercentage}%</span>
          </div>
        </div>

      ${me(e)}
    </div>
  `}function me(e){const t=e.mandatoryDeductions;return`
    <div class="deductions-breakdown">
      <h3>Detalles sobre los descuentos</h3>

      <div class="deductions-table">
        ${w("Jubilación : ",t.pension,t.pensionPercentage)}
        ${w("PAMI : ",t.pami,t.pamiPercentage)}
        ${w("Obra Social : ",t.healthInsurance,t.healthInsurancePercentage)}
        ${e.hasUnion?w("Sindicato : ",t.union,t.unionPercentage):""}
        ${pe(e)}
      </div>

      <div class="total-deductions">
        <span class="total-deductions-title">Total descuentos : </span>
        <span class="amount">$${h(e.totalDeductions)}</span>
      </div>
    </div>
  `}function w(e,t,n){return`
    <div class="deduction-row">
      <span class="deduction-name">${e}</span>
      <span class="amount">$${h(t)} / </span>
      <span class="percentage">${n}%</span>
    </div>
  `}function pe(e){const t=e.mandatoryDeductions.incomeTax;if(t===0)return`
      <div class="deduction-row">
        <span class="deduction-name">Ganancias : </span>
        <span class="percentage">-</span>
        <span class="amount">$0,00</span>
      </div>
      <div class="positive-note">
        <small>✓ No pagás Ganancias (por debajo del mínimo no imponible)</small>
      </div>
    `;const n=e.mandatoryDeductions.incomeTaxDetail;return`
    <div class="deduction-row">
      <span class="deduction-name">Ganancias : </span>
      <span class="percentage">Variable</span>
      <span class="amount">$${h(t)}</span>
    </div>
    ${n?`
      <div class="income-tax-detail">
        <small>
          Sueldo imponible : $${h(n.taxableSalary)} | 
          Alícuota : ${n.appliedBracket.rate}%
        </small>
      </div>
    `:""}
  `}function M(e,t){const n=document.getElementById(e);n.innerHTML=`
    <div class="calculation-error entrance-animation">
      <p>⚠️ ${t}</p>
    </div>
  `}function ve(){const e=document.getElementById("theme-toggle");if(!e)return;const t=localStorage.getItem("theme"),n=window.matchMedia("(prefers-color-scheme: dark)").matches,a=t?t==="dark":n;a&&document.documentElement.classList.add("dark-mode"),P(e,a),e.addEventListener("click",()=>{const o=document.documentElement.classList.toggle("dark-mode");localStorage.setItem("theme",o?"dark":"light"),P(e,o)})}function P(e,t){const n=e.querySelector(".light-theme-icon"),a=e.querySelector(".dark-theme-icon");n&&a?(n.style.display=t?"none":"block",a.style.display=t?"block":"none"):e.textContent=t?"🌙":"☀️"}const C=document.querySelector("header"),f=document.querySelector(".menu-toggle"),D=document.querySelector("nav"),$=document.createElement("div");$.className="menu-overlay";document.body.appendChild($);function S(){const e=f.getAttribute("aria-expanded")==="true";f.setAttribute("aria-expanded",!e),D.classList.toggle("is-open"),$.classList.toggle("is-active"),e?document.body.style.overflow="":document.body.style.overflow="hidden"}f&&(f.addEventListener("click",S),f.addEventListener("touchend",e=>{e.preventDefault(),S()},{passive:!1}));D&&D.querySelectorAll("a").forEach(t=>{t.addEventListener("click",()=>{f.getAttribute("aria-expanded")==="true"&&S()})});$.addEventListener("click",()=>{D.classList.remove("is-open"),$.classList.remove("is-active"),f.setAttribute("aria-expanded","false")});document.addEventListener("click",e=>{C&&C.classList.contains("menu-open")&&!D.contains(e.target)&&!f.contains(e.target)&&S()});document.addEventListener("keydown",e=>{e.key==="Escape"&&f.getAttribute("aria-expanded")==="true"&&S()});ve();const N=document.getElementById("prices-section");N&&(N.innerHTML=`
    <article id="prices-section-container" class="prices-section-container width-page"></article>
  `,setTimeout(()=>{O("prices-section-container")},0));const ge=document.getElementById("conversion-form");ge&&X("conversion-form");const fe=document.getElementById("calculateBonus");fe&&ee("calculateBonus");const ye=document.getElementById("net-salary-calculator-container");ye&&ie("net-salary-calculator-container");
