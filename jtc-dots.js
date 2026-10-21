/*!
 * JTC Dots: Julie Torrisi-Coffey's dot-screen type for the web.
 * The whole page is one dot screen (like the deck). Text is drawn by lighting
 * dots on that same grid, so every letter lines up with the background.
 *
 *   <h1 class="jtc" data-role="hero" data-cursor>Julie<br>Torrisi-Coffey</h1>
 *   <h2 class="jtc" data-role="h2">How I <em>measure</em> output</h2>
 *   <p  class="jtc" data-role="body">A sentence that runs full width.</p>
 *   <p  class="jtc" data-role="kicker">&gt; Workflow</p>
 *
 * Roles: hero (flips, scales to fit, up to 3x) · h2 (flips, 2x) · body (types on, 1x, keeps case)
 *        statement (a sentence-length hero: flips, 2x, scales down to fit, fills the width)
 *        kicker (types on, 1x, grey, caps). data-ink="ink|grey|signal" overrides colour.
 * <em> = signal red. <br> = line break. Text wraps full width and never leaves one word alone
 * on the last line. Animates once when scrolled into view. Real text stays for screen readers.
 */
(function () {
  var G = {"0":"4ahhha400","1":"4ck444v00","2":"eh168gv00","3":"v1261he00","4":"26aiv2200","5":"vgmp1he00","6":"68gmphe00","7":"v12248800","8":"ehhehhe00","9":"ehjd12c00"," ":"000000000","!":"444440400","\"":"aaa000000","#":"aavavaa00","$":"4eke5e400","%":"9la4ali00","&":"8kk8lid00","'":"444000000","(":"248884200",")":"842224800","*":"0havah000","+":"044v44000",",":"00000c480","-":"000v00000",".":"00000cc00","/":"11248gg00",":":"0cc00cc00",";":"0cc00c480","<":"124842100","=":"00v0v0000",">":"842124800","?":"eh2440400","@":"ehjlmge00","A":"4ahhvhh00","B":"u99e99u00","C":"ehggghe00","D":"u99999u00","E":"vgguggv00","F":"vgguggg00","G":"ehggjhe00","H":"hhhvhhh00","I":"e44444e00","J":"72222ic00","K":"hikokih00","L":"ggggggv00","M":"hhrlhhh00","N":"hhpljhh00","O":"ehhhhhe00","P":"uhhuggg00","Q":"ehhhhle10","R":"uhhukih00","S":"ehge1he00","T":"v44444400","U":"hhhhhhe00","V":"hhhaaa400","W":"hhhllrh00","X":"hha4ahh00","Y":"hha444400","Z":"v1248gv00","[":"e88888e00","\\":"gg8421100","]":"e22222e00","^":"4ah000000","_":"0000000v0","a":"00e1fhf00","b":"ggmphpm00","c":"00ehghe00","d":"11djhjd00","e":"00ehvge00","f":"698u88800","g":"00fhhf1he","h":"ggmphhh00","i":"40c444e00","j":"103111996","k":"gghisih00","l":"c44444e00","m":"00qlllh00","n":"00mphhh00","o":"00ehhhe00","p":"00mphpmgg","q":"00djhjd11","r":"00mpggg00","s":"00ege1u00","t":"88u889600","u":"00hhhjd00","v":"00hhaa400","w":"00hhlla00","x":"00ha4ah00","y":"00hhjd1he","z":"00v248v00","{":"342c24300","|":"444444400","}":"c24342c00","~":"9li000000","’":"624000000","‘":"246000000","“":"9ir000000","”":"r9i000000","·":"000cc0000","•":"006ff6000","–":"000v00000","—":"000v00000","…":"000000l00","↑":"04c444400","↓":"044444400","×":"00ha4ah00","÷":"040v04000","°":"4a4000000","©":"ehlplhe00","®":"ehtpphe00","€":"69s8s9600","£":"698s89m00","→":"042v24000","←":"048v84000","`":"840000000","é":"24ehvge00"};
  var FILL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var STEP = 78, KMIN = 6, KMAX = 12, LINE_DELAY = 120, CHAR_DELAY = 34, BLINK = 530;
  var ROLES = {
    hero:   { s: 3, min: 1, fit: true, upper: true,  flip: true,  ink: 'ink',  lead: 11 },
    h2:     { s: 2, min: 1,            upper: true,  flip: true,  ink: 'ink',  lead: 11 },
    statement: { s: 2, min: 1, fit: true, upper: true, flip: true, ink: 'ink', lead: 11 },
    h3:     { s: 1, min: 1,            upper: true,  flip: true,  ink: 'ink',  lead: 11 },
    body:   { s: 1, min: 1,            upper: false, flip: false, ink: 'grey', lead: 12 },
    lead:   { s: 1, min: 1,            upper: false, flip: false, ink: 'ink',  lead: 12 },
    kicker: { s: 1, min: 1,            upper: true,  flip: false, ink: 'grey', lead: 11 }
  };
  var COLORS = { bg: '#0b0c0c', unlit: '#161918', dim: '#30353a', grey: '#9da3a1', ink: '#f7f8f8', signal: '#ff5a60' };
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var P = 4;

  function pitchFor(w) { return w >= 1280 ? 5 : w >= 860 ? 4 : 3; }
  function setPitch() {
    P = pitchFor(window.innerWidth);
    document.documentElement.style.setProperty('--jtc-p', P + 'px');
  }

  var css = document.createElement('style');
  var c = COLORS;
  css.textContent =
    ':root{--jtc-bg:' + c.bg + ';--jtc-unlit:' + c.unlit + ';--jtc-dim:' + c.dim + ';--jtc-grey:' + c.grey + ';--jtc-ink:' + c.ink + ';--jtc-signal:' + c.signal + ';--jtc-p:4px;color-scheme:dark}' +
    'html{background-color:var(--jtc-bg);background-image:radial-gradient(circle at center,var(--jtc-unlit) calc(var(--jtc-p) * .4),transparent calc(var(--jtc-p) * .4 + .6px));background-size:var(--jtc-p) var(--jtc-p);background-position:0 0;overflow-x:hidden}' +
    'body{background:transparent;margin:0}' +
'html,body{cursor:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2724%27 height=%2738%27 shape-rendering=%27crispEdges%27%3E%3Crect x=%270%27 y=%270%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%270%27 y=%272%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%272%27 y=%272%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%270%27 y=%274%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%272%27 y=%274%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%274%27 y=%274%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%270%27 y=%276%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%272%27 y=%276%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%274%27 y=%276%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%276%27 y=%276%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%270%27 y=%278%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%272%27 y=%278%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%274%27 y=%278%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%276%27 y=%278%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%278%27 y=%278%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%270%27 y=%2710%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%272%27 y=%2710%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%274%27 y=%2710%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%276%27 y=%2710%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%278%27 y=%2710%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%2710%27 y=%2710%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%270%27 y=%2712%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%272%27 y=%2712%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%274%27 y=%2712%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%276%27 y=%2712%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%278%27 y=%2712%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%2710%27 y=%2712%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%2712%27 y=%2712%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%270%27 y=%2714%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%272%27 y=%2714%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%274%27 y=%2714%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%276%27 y=%2714%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%278%27 y=%2714%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%2710%27 y=%2714%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%2712%27 y=%2714%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%2714%27 y=%2714%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%270%27 y=%2716%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%272%27 y=%2716%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%274%27 y=%2716%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%276%27 y=%2716%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%278%27 y=%2716%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%2710%27 y=%2716%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%2712%27 y=%2716%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%2714%27 y=%2716%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%2716%27 y=%2716%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%270%27 y=%2718%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%272%27 y=%2718%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%274%27 y=%2718%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%276%27 y=%2718%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%278%27 y=%2718%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%2710%27 y=%2718%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%2712%27 y=%2718%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%2714%27 y=%2718%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%2716%27 y=%2718%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%2718%27 y=%2718%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%270%27 y=%2720%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%272%27 y=%2720%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%274%27 y=%2720%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%276%27 y=%2720%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%278%27 y=%2720%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%2710%27 y=%2720%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%2712%27 y=%2720%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%2714%27 y=%2720%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%2716%27 y=%2720%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%2718%27 y=%2720%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%2720%27 y=%2720%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%270%27 y=%2722%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%272%27 y=%2722%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%274%27 y=%2722%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%276%27 y=%2722%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%278%27 y=%2722%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%2710%27 y=%2722%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%2712%27 y=%2722%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%2714%27 y=%2722%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%2716%27 y=%2722%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%2718%27 y=%2722%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%2720%27 y=%2722%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%2722%27 y=%2722%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%270%27 y=%2724%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%272%27 y=%2724%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%274%27 y=%2724%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%276%27 y=%2724%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%278%27 y=%2724%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%2710%27 y=%2724%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%2712%27 y=%2724%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%2714%27 y=%2724%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%270%27 y=%2726%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%272%27 y=%2726%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%274%27 y=%2726%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%276%27 y=%2726%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%278%27 y=%2726%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%2710%27 y=%2726%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%2712%27 y=%2726%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%2714%27 y=%2726%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%270%27 y=%2728%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%272%27 y=%2728%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%274%27 y=%2728%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%278%27 y=%2728%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%2710%27 y=%2728%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%2712%27 y=%2728%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%2714%27 y=%2728%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%270%27 y=%2730%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%272%27 y=%2730%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%2710%27 y=%2730%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%2712%27 y=%2730%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%2714%27 y=%2730%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%2716%27 y=%2730%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%270%27 y=%2732%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%2712%27 y=%2732%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%2714%27 y=%2732%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%2716%27 y=%2732%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%2718%27 y=%2732%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%2712%27 y=%2734%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%2714%27 y=%2734%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%2716%27 y=%2734%27 width=%272%27 height=%272%27 fill=%27%23f7f8f8%27/%3E%3Crect x=%2718%27 y=%2734%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%2714%27 y=%2736%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3Crect x=%2716%27 y=%2736%27 width=%272%27 height=%272%27 fill=%27%230b0c0c%27/%3E%3C/svg%3E") 0 0,default}' +
    'a,button,summary,label,[role=button],.jv canvas,.btn{cursor:url("data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2728%27%20height=%2734%27%20shape-rendering=%27crispEdges%27%3E%3Crect%20x=%270%27%20y=%2716%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%270%27%20y=%2718%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%270%27%20y=%2720%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%270%27%20y=%2722%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%270%27%20y=%2724%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%272%27%20y=%2716%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%272%27%20y=%2724%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%274%27%20y=%2714%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%274%27%20y=%2716%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%274%27%20y=%2724%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%274%27%20y=%2726%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%276%27%20y=%2714%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%276%27%20y=%2726%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%276%27%20y=%2728%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%278%27%20y=%270%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%278%27%20y=%272%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%278%27%20y=%274%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%278%27%20y=%276%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%278%27%20y=%278%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%278%27%20y=%2710%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%278%27%20y=%2712%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%278%27%20y=%2714%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%278%27%20y=%2728%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%278%27%20y=%2730%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%278%27%20y=%2732%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%2710%27%20y=%270%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%2710%27%20y=%2732%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%2712%27%20y=%270%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%2712%27%20y=%2732%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%2714%27%20y=%270%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%2714%27%20y=%272%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%2714%27%20y=%274%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%2714%27%20y=%276%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%2714%27%20y=%278%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%2714%27%20y=%2710%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%2714%27%20y=%2712%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%2714%27%20y=%2714%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%2714%27%20y=%2716%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%2714%27%20y=%2732%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%2716%27%20y=%2710%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%2716%27%20y=%2732%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%2718%27%20y=%2710%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%2718%27%20y=%2732%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%2720%27%20y=%2710%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%2720%27%20y=%2712%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%2720%27%20y=%2714%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%2720%27%20y=%2716%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%2720%27%20y=%2732%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%2722%27%20y=%2712%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%2722%27%20y=%2732%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%2724%27%20y=%2712%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%2724%27%20y=%2728%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%2724%27%20y=%2730%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%2724%27%20y=%2732%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%2726%27%20y=%2712%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%2726%27%20y=%2714%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%2726%27%20y=%2716%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%2726%27%20y=%2718%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%2726%27%20y=%2720%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%2726%27%20y=%2722%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%2726%27%20y=%2724%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%2726%27%20y=%2726%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%2726%27%20y=%2728%27%20width=%272%27%20height=%272%27%20fill=%27%230b0c0c%27/%3E%3Crect%20x=%272%27%20y=%2718%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%272%27%20y=%2720%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%272%27%20y=%2722%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%274%27%20y=%2718%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%274%27%20y=%2720%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%274%27%20y=%2722%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%276%27%20y=%2716%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%276%27%20y=%2718%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%276%27%20y=%2720%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%276%27%20y=%2722%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%276%27%20y=%2724%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%278%27%20y=%2716%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%278%27%20y=%2718%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%278%27%20y=%2720%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%278%27%20y=%2722%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%278%27%20y=%2724%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%278%27%20y=%2726%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2710%27%20y=%272%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2710%27%20y=%274%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2710%27%20y=%276%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2710%27%20y=%278%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2710%27%20y=%2710%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2710%27%20y=%2712%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2710%27%20y=%2714%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2710%27%20y=%2716%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2710%27%20y=%2718%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2710%27%20y=%2720%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2710%27%20y=%2722%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2710%27%20y=%2724%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2710%27%20y=%2726%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2710%27%20y=%2728%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2710%27%20y=%2730%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2712%27%20y=%272%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2712%27%20y=%274%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2712%27%20y=%276%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2712%27%20y=%278%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2712%27%20y=%2710%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2712%27%20y=%2712%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2712%27%20y=%2714%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2712%27%20y=%2716%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2712%27%20y=%2718%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2712%27%20y=%2720%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2712%27%20y=%2722%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2712%27%20y=%2724%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2712%27%20y=%2726%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2712%27%20y=%2728%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2712%27%20y=%2730%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2714%27%20y=%2718%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2714%27%20y=%2720%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2714%27%20y=%2722%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2714%27%20y=%2724%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2714%27%20y=%2726%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2714%27%20y=%2728%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2714%27%20y=%2730%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2716%27%20y=%2712%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2716%27%20y=%2714%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2716%27%20y=%2716%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2716%27%20y=%2718%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2716%27%20y=%2720%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2716%27%20y=%2722%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2716%27%20y=%2724%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2716%27%20y=%2726%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2716%27%20y=%2728%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2716%27%20y=%2730%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2718%27%20y=%2712%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2718%27%20y=%2714%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2718%27%20y=%2716%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2718%27%20y=%2718%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2718%27%20y=%2720%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2718%27%20y=%2722%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2718%27%20y=%2724%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2718%27%20y=%2726%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2718%27%20y=%2728%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2718%27%20y=%2730%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2720%27%20y=%2718%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2720%27%20y=%2720%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2720%27%20y=%2722%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2720%27%20y=%2724%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2720%27%20y=%2726%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2720%27%20y=%2728%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2720%27%20y=%2730%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2722%27%20y=%2714%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2722%27%20y=%2716%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2722%27%20y=%2718%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2722%27%20y=%2720%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2722%27%20y=%2722%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2722%27%20y=%2724%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2722%27%20y=%2726%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2722%27%20y=%2728%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2722%27%20y=%2730%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2724%27%20y=%2714%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2724%27%20y=%2716%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2724%27%20y=%2718%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2724%27%20y=%2720%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2724%27%20y=%2722%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2724%27%20y=%2724%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3Crect%20x=%2724%27%20y=%2726%27%20width=%272%27%20height=%272%27%20fill=%27%23ff5a60%27/%3E%3C/svg%3E") 12 0,pointer}' +
    '.jtc{margin:0;line-height:0;position:relative}.jtc canvas{display:block;width:100%}' +
    '.jtc-sr{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}';
  document.head.appendChild(css);
  setPitch();

  var cache = {};
  function glyph(ch) {
    if (cache[ch] !== undefined) return cache[ch];
    var s = G[ch];
    if (!s) { cache[ch] = null; return null; }
    var r = [];
    for (var i = 0; i < 9; i++) r.push(parseInt(s[i], 32));
    return (cache[ch] = r);
  }
  function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  var MAP = { '’': "'", '‘': "'", '“': '"', '”': '"', '–': '-', '—': '-', '…': '...' };

  function parse(el, upper) {
    var out = [];
    (function walk(node, ink) {
      node.childNodes.forEach(function (n) {
        if (n.nodeType === 3) {
          var t = n.textContent.replace(/\s+/g, ' ');
          if (upper) t = t.toUpperCase();
          t.split('').forEach(function (ch) {
            ch = MAP[ch] || ch;
            ch.split('').forEach(function (x) { out.push({ ch: x, ink: ink }); });
          });
        } else if (n.nodeType === 1 && n.tagName === 'BR') out.push({ ch: '\n', ink: ink });
        else if (n.nodeType === 1) walk(n, /^(EM|STRONG|MARK)$/.test(n.tagName) ? 'signal' : ink);
      });
    })(el, null);
    // trim spaces around breaks and ends
    out = out.filter(function (c, i, a) {
      return !(c.ch === ' ' && ((a[i - 1] && a[i - 1].ch === '\n') || (a[i + 1] && a[i + 1].ch === '\n')));
    });
    while (out.length && out[0].ch === ' ') out.shift();
    while (out.length && out[out.length - 1].ch === ' ') out.pop();
    return out;
  }

  // words: arrays of chars; 'BR' marks forced breaks. Long words split after hyphens, then hard.
  function words(chars, perLine) {
    var ws = [], cur = [];
    chars.forEach(function (c) {
      if (c.ch === ' ' || c.ch === '\n') { if (cur.length) ws.push(cur); cur = []; if (c.ch === '\n') ws.push('BR'); }
      else cur.push(c);
    });
    if (cur.length) ws.push(cur);
    var out = [];
    ws.forEach(function (w) {
      if (w === 'BR' || w.length <= perLine) { out.push(w); return; }
      var piece = [];
      w.forEach(function (c, i) {
        piece.push(c);
        var atHyphen = c.ch === '-' && piece.length <= perLine;
        if (atHyphen || piece.length === perLine) { piece.glue = true; out.push(piece); piece = []; }
      });
      if (piece.length) out.push(piece); else out[out.length - 1].glue = false;
    });
    return out;
  }

  function wrap(chars, perLine) {
    var ws = words(chars, perLine);
    var paras = [[]];
    ws.forEach(function (w) { if (w === 'BR') paras.push([]); else paras[paras.length - 1].push(w); });
    var lines = [];
    paras.forEach(function (p) {
      var pl = [[]], prevGlue = false;
      p.forEach(function (w) {
        var L = pl[pl.length - 1], sep = L.length && !prevGlue ? 1 : 0;
        if (L.length && L.len + sep + w.length > perLine) { pl.push([]); L = pl[pl.length - 1]; sep = 0; }
        L.len = (L.len || 0) + sep + w.length;
        L.push({ w: w, sep: sep });
        prevGlue = !!w.glue;
      });
      // No widows: if the last line holds one word, pull words down from the line above.
      for (var guard = 0; guard < 4 && pl.length > 1; guard++) {
        var last = pl[pl.length - 1], prev = pl[pl.length - 2];
        if (last.length !== 1 || prev.length < 2) break;
        var moved = prev.pop();
        var newLen = moved.w.length + 1 + last.len;
        if (newLen > perLine) { prev.push(moved); break; }
        prev.len -= moved.w.length + moved.sep;
        last[0].sep = 1; moved.sep = 0;
        last.unshift(moved); last.len = newLen;
      }
      pl.forEach(function (L) {
        var line = [];
        L.forEach(function (it) { if (it.sep) line.push({ ch: ' ' }); it.w.forEach(function (c) { line.push(c); }); });
        lines.push(line);
      });
    });
    return lines;
  }

  function hasWidow(lines) {
    if (lines.length < 2) return false;
    var last = lines[lines.length - 1].map(function (c) { return c.ch; }).join('').trim();
    return last.indexOf(' ') < 0;
  }

  function Text(el) {
    this.el = el;
    var role = el.dataset.role || (el.dataset.size === 'hero' ? 'hero' : 'h2');
    this.r = ROLES[role] || ROLES.body;
    this.role = role;
    this.ink = el.dataset.ink || this.r.ink;
    this.cursor = el.hasAttribute('data-cursor');
    this.chars = parse(el, this.r.upper);
    var sr = document.createElement('span');
    sr.className = 'jtc-sr';
    while (el.firstChild) sr.appendChild(el.firstChild);
    el.appendChild(sr);
    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('aria-hidden', 'true');
    el.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.played = false; this.start = null; this.raf = 0;
  }

  Text.prototype.layout = function () {
    var w = this.el.clientWidth;
    this.cols = Math.max(6, Math.floor(w / P) - 1);
    var segs = [], seg = 0, longest = 0, run = 0;
    this.chars.forEach(function (c) {
      if (c.ch === '\n') { segs.push(seg); seg = 0; } else seg++;
      run = (c.ch === ' ' || c.ch === '\n') ? 0 : run + 1; longest = Math.max(longest, run);
    });
    segs.push(seg);
    var extra = this.cursor ? 2 : 0;
    var s = this.r.s;
    if (this.r.fit) {
      var widest = Math.max.apply(null, segs) + extra;
      s = Math.min(this.r.s, Math.max(this.r.min, Math.floor(this.cols / (widest * 6))));
      if (s < 2 && this.r.s >= 2) {
        // allow breaking after hyphens ("Torrisi-" / "Coffey") to stay large on phones
        var piece = 0, maxPiece = 0;
        this.chars.forEach(function (c) {
          if (c.ch === ' ' || c.ch === '\n') { piece = 0; return; }
          piece++; maxPiece = Math.max(maxPiece, piece);
          if (c.ch === '-') piece = 0;
        });
        for (var t = this.r.s; t > s; t--) {
          if (Math.floor((this.cols + t) / (6 * t)) - extra >= maxPiece) { s = t; break; }
        }
      }
    } else {
      while (s > this.r.min && Math.floor(this.cols / (6 * s)) < longest + extra) s--;
    }
    var perLine, lines;
    for (;;) {
      perLine = Math.max(1, Math.floor((this.cols + s) / (6 * s)) - extra);
      lines = wrap(this.chars, perLine);
      if (this.role === 'hero' || s <= this.r.min || !hasWidow(lines)) break;
      s--;
    }
    this.s = s;
    this.lines = lines;
    this.lineH = this.r.lead * s;
    this.rows = this.lines.length * this.lineH - (this.r.lead - 9) * s + 1;
    var dpr = window.devicePixelRatio || 1;
    this.dpr = dpr;
    this.cw = w; this.ch = (this.rows + 1) * P;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(this.ch * dpr);
    this.canvas.style.height = this.ch + 'px';

    var self = this;
    this.cells = [];
    var k = 0, n = 0;
    this.lines.forEach(function (line, li) {
      line.forEach(function (c, ci) {
        if (c.ch === ' ') return;
        var seq = [];
        if (self.r.flip && /[A-Z0-9]/.test(c.ch)) for (var q = rnd(KMIN, KMAX); q > 0; q--) seq.push(FILL[rnd(0, FILL.length - 1)]);
        seq.push(c.ch);
        self.cells.push({ x: ci * 6 * s, y: li * self.lineH, ink: c.ink || self.ink, seq: seq, idx: n++, li: li, ci: ci });
      });
    });
    var total = this.cells.length;
    var typeStep = Math.min(14, 1100 / Math.max(1, total));
    this.cells.forEach(function (c) {
      c.t0 = self.r.flip ? c.li * LINE_DELAY + c.ci * CHAR_DELAY : c.idx * typeStep;
      c.dur = self.r.flip ? c.seq.length * STEP : 1;
    });
    var last = this.lines[this.lines.length - 1];
    this.cursorAt = { x: (last.length + 1) * 6 * s, y: (this.lines.length - 1) * this.lineH };
    this.end = this.cells.reduce(function (m, c) { return Math.max(m, c.t0 + c.dur); }, 0);
    this.draw(this.played ? Infinity : -1);
  };

  Text.prototype.origin = function () {
    var r = this.canvas.getBoundingClientRect();
    var px = r.left + window.scrollX, py = r.top + window.scrollY;
    return { x: ((P - (px % P)) % P), y: ((P - (py % P)) % P) };
  };

  Text.prototype.block = function (o, gx, gy, rows, color, sy) {
    var s = this.s, d = this.dpr, ctx = this.ctx, rad = P * 0.4 * d;
    ctx.fillStyle = color; ctx.beginPath();
    for (var y = 0; y < rows.length; y++) for (var x = 0; x < 5; x++) {
      if (!(rows[y] & (1 << (4 - x)))) continue;
      for (var a = 0; a < s; a++) for (var b = 0; b < s; b++) {
        var cx = (o.x + (gx + x * s + b) * P + P / 2) * d;
        var cy = (o.y + (gy + y * s + a) * P + P / 2) * d;
        if (cx > this.canvas.width) continue;
        ctx.moveTo(cx + rad, cy);
        ctx.ellipse(cx, cy, rad, Math.max(0.01, rad * sy), 0, 0, Math.PI * 2);
      }
    }
    ctx.fill();
  };

  Text.prototype.draw = function (t) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (t < 0) return false;
    var o = this.origin(), self = this, moving = false;
    this.cells.forEach(function (c) {
      var col = COLORS[c.ink] || COLORS.ink, dt = t - c.t0;
      if (dt < 0) { moving = true; return; }
      if (!self.r.flip || dt >= c.dur) { var g = glyph(c.seq[c.seq.length - 1]); if (g) self.block(o, c.x, c.y, g, col, 1); return; }
      moving = true;
      var i = Math.floor(dt / STEP), ph = (dt - i * STEP) / STEP;
      var ch = ph < 0.5 ? (i === 0 ? null : c.seq[i - 1]) : c.seq[i];
      var g2 = ch && glyph(ch);
      if (g2) self.block(o, c.x, c.y, g2, col, ph < 0.5 ? 1 - 2 * ph : 2 * ph - 1);
    });
    if (this.cursor && t >= this.end) {
      var on = !isFinite(t) || Math.floor((t - this.end) / BLINK) % 2 === 0;
      if (on) this.block(o, this.cursorAt.x, this.cursorAt.y, [31, 31, 31, 31, 31, 31, 31], COLORS.ink, 1);
      moving = isFinite(t);
    }
    return moving;
  };

  Text.prototype.play = function () {
    if (this.played) return;
    this.played = true;
    if (reduced) { this.done = true; this.draw(Infinity); return; }
    var self = this;
    this.start = null;
    var tick = function (now) {
      if (self.start === null) self.start = now;
      if (self.draw(now - self.start)) self.raf = requestAnimationFrame(tick); else self.done = true;
    };
    this.raf = requestAnimationFrame(tick);
  };

  var items = [];
  function relayout() {
    setPitch();
    items.forEach(function (t) {
      cancelAnimationFrame(t.raf);
      t.layout();
      if (t.played) t.done = true;
      if (t.played && t.cursor && !reduced) {
        var t0 = null;
        var tick = function (now) { if (t0 === null) t0 = now; t.draw(t.end + (now - t0)); t.raf = requestAnimationFrame(tick); };
        t.raf = requestAnimationFrame(tick);
      }
    });
  }
  function init() {
    items = [].slice.call(document.querySelectorAll('.jtc, .jtc-headline')).map(function (el) { return new Text(el); });
    items.forEach(function (t) { t.layout(); });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var t = items.find(function (x) { return x.el === e.target; });
        if (t) { t.play(); io.unobserve(e.target); }
      });
    }, { threshold: 0.2 });
    items.forEach(function (t) { io.observe(t.el); });
    var lastW = window.innerWidth, timer;
    window.addEventListener('resize', function () {
      if (window.innerWidth === lastW) return;
      lastW = window.innerWidth;
      clearTimeout(timer); timer = setTimeout(relayout, 120);
    });
    // Re-align static text if anything above it changes height (fonts, live data loading).
    var lastH = document.body.scrollHeight;
    new ResizeObserver(function () {
      var h = document.body.scrollHeight;
      if (h === lastH) return;
      lastH = h;
      items.forEach(function (t) { if (t.done) t.draw(Infinity); });
    }).observe(document.body);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.JTCDots = { items: function () { return items; }, relayout: relayout, colors: COLORS };
})();
