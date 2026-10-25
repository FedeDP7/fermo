"""Build the reviewed pitch: python docs/pitch/build_pitch.py (requires reportlab).

No remote requests. Uses Windows Arial or Linux DejaVu; embeds fonts in the PDF.
Content and sources are intentionally versioned alongside the finished document.
"""
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
W, H = 1280, 720
NAVY, TEAL, WHITE, MUTED = '#0B1530', '#2DD4BF', '#F2F6FF', '#B3C1D9'
# Match .studio-header .studio-logo in src/styles.css: a 36x41 viewport,
# 66px-wide image at (-15, -4.5), brightness(0) invert(1).
# Preserve the original alpha; clipping removes the wordmark embedded in PNG.
original_logo = Image.open(ROOT / 'logo' / 'logo.png').convert('RGBA')
white_logo = Image.new('RGBA', original_logo.size, (255, 255, 255, 0))
white_logo.putalpha(original_logo.getchannel('A'))
site_logo = ImageReader(white_logo)

def draw_site_logo(x, y, scale=0.7):
    c.saveState()
    clip = c.beginPath()
    clip.rect(x, y, 36 * scale, 41 * scale)
    c.clipPath(clip, stroke=0)
    image_height = 66 * original_logo.height / original_logo.width
    c.drawImage(site_logo, x - 15 * scale,
                y + (41 + 4.5 - image_height) * scale,
                width=66 * scale, height=image_height * scale, mask='auto')
    c.restoreState()
for regular, bold in [
    (Path('C:/Windows/Fonts/arial.ttf'), Path('C:/Windows/Fonts/arialbd.ttf')),
    (Path('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'), Path('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf')),
]:
    if regular.exists() and bold.exists():
        pdfmetrics.registerFont(TTFont('Body', str(regular)))
        pdfmetrics.registerFont(TTFont('Strong', str(bold)))
        break
else:
    raise SystemExit('Install Arial or DejaVu Sans before building the pitch.')
pdfmetrics.registerFontFamily('Body', normal='Body', bold='Strong')
c = canvas.Canvas(str(HERE / 'FERMO-pitch-revisionato.pdf'), pagesize=(W, H))
c.setTitle('FERMO - Un controllo in più. Un rischio in meno.')
c.setAuthor('Team FERMO')
c.setSubject('Pitch hackathon - MVP, limiti e ipotesi commerciali - 24 ottobre 2026')

def text(value, x, top, width, size=25, color=WHITE, bold=False):
    style = ParagraphStyle('p', fontName='Strong' if bold else 'Body', fontSize=size,
                           leading=size * 1.25, textColor=HexColor(color))
    p = Paragraph(value, style)
    _, height = p.wrap(width, H)
    if top < 660 and top + height > 652:
        raise ValueError(f'Text exceeds content area: {value[:70]}')
    p.drawOn(c, x, H - top - height)
    return height

def line(x, top, width, color=TEAL):
    c.setStrokeColor(HexColor(color)); c.setLineWidth(2)
    c.line(x, H-top, x+width, H-top)

def start(number, section, title, subtitle=None):
    c.setFillColor(HexColor(NAVY)); c.rect(0, 0, W, H, fill=1, stroke=0)
    text(section.upper(), 64, 40, 1040, 15, TEAL, True)
    text(title, 64, 82, 1152, 43, WHITE, True)
    if subtitle:
        text(subtitle, 64, 198, 1140, 23, MUTED)
    c.setStrokeColor(HexColor('#263654')); c.setLineWidth(1)
    c.line(64, 49, 1216, 49)
    draw_site_logo(64, 12)
    text('FERMO', 99, 681, 150, 16, WHITE, True)
    text('Starting Finance × Paradigma | Padova, 24 ottobre 2026', 265, 682, 820, 13, MUTED)
    text(f'{number:02d} / 13', 1130, 682, 100, 13, MUTED)

def finish(source=None, url=None):
    if source:
        text(source, 64, 621, 1140, 13, MUTED)
        if url:
            c.linkURL(url, (64, 62, 1215, 101), relative=0, thickness=0)
    c.showPage()

def block(x, top, width, label, body, size=25):
    line(x, top, width)
    text(label, x, top+19, width, 27, TEAL, True)
    text(body, x, top+71, width, size)

start(1, 'La decisione', 'Una mail. Un nuovo IBAN.<br/>Voi paghereste?',
      'FERMO aiuta le PMI a fermarsi e verificare, prima di agire.')
text('150.000 €', 64, 310, 700, 96, TEAL, True)
text('Un caso reale di frode via email a un’azienda vicentina.<br/>Le somme sono state recuperate.', 68, 445, 1040, 28)
finish('Caso di cronaca: Corriere del Veneto, 24 giugno 2025. Un caso, non una stima del danno medio.',
       'https://corrieredelveneto.corriere.it/notizie/vicenza/cronaca/25_giugno_24/vicenza-si-insinuano-nella-mail-dell-azienda-rubati-e-recuperati-150-mila-euro-4962c082-ee92-4e9a-b704-10f51d1ebxlk.shtml')

start(2, 'Il problema', 'Il rischio arriva nel lavoro quotidiano.',
      'Amministrazione e acquisti devono decidere anche davanti a richieste plausibili.')
block(64, 294, 530, 'Oltre 269 milioni €', 'Volumi delle frodi informatiche in Italia nel 2025.<br/><br/>Un dato di contesto: non misura solo le frodi alle PMI.', 25)
block(670, 294, 530, '16% nel livello maturo', 'Nel campione di 1.500 imprese di Cyber Index PMI 2025.<br/><br/>Il campione non coincide con tutte le PMI italiane.', 25)
finish('Fonti: Comunicazione UIF 8 giugno 2026; rapporto Cyber Index PMI 2025. Link e perimetri nel README del pitch.')

start(3, 'La soluzione', 'Un controllo in più.<br/>Un rischio in meno.')
block(64, 270, 340, '01  Incolla', 'Il testo di un’email, un messaggio o una richiesta di pagamento.')
block(468, 270, 340, '02  Comprendi', 'Indice euristico, segnali spiegati e controllo sintattico dei domini.')
block(872, 270, 340, '03  Verifica', 'Passaggi consigliati e riepilogo copiabile per il responsabile.')
text('Analisi locale nel browser, con regole deterministiche.<br/>Il punteggio non è una probabilità di frode.', 64, 530, 1140, 25, TEAL)
finish()

start(4, 'Demo reale del prototipo', 'Cambio IBAN: un segnale da verificare.')
c.drawImage(str(HERE/'assets'/'demo-locale.png'), 64, 119, width=784, height=441,
            preserveAspectRatio=True, mask='auto')
text('25 / 100', 897, 206, 310, 54, TEAL, True)
text('Rischio MEDIO', 900, 284, 300, 27, WHITE, True)
text('Il motore segnala il cambio di coordinate.<br/><br/>Prima azione: sospendere l’autorizzazione e verificare con un contatto già noto.', 900, 340, 300, 24)
finish('Schermata locale del 24 ottobre 2026, testo fittizio. Esito verificato: 25/100, MEDIO, un segnale attivo.')

start(5, 'Primo segmento', 'PMI italiane, a partire dall’amministrazione.',
      'Focus iniziale da validare: aziende di 10-249 addetti senza un team cyber dedicato.')
block(64, 300, 530, 'Chi lo usa', 'Amministrazione, contabilità e acquisti.<br/><br/>Casi prioritari: cambio IBAN, falso CEO, phishing aziendale e fatture sospette.')
block(670, 300, 530, 'Chi decide', 'Titolare, CFO o responsabile amministrativo.<br/><br/>Il bisogno da validare: una verifica semplice nel momento della decisione.')
finish('Segmento e ruoli: ipotesi di posizionamento del team, non risultati di interviste o vendite.')

start(6, 'Valore', 'Dal dubbio a una verifica concreta.',
      'Il report spiega cosa ha rilevato e suggerisce il prossimo passo.')
block(64, 300, 340, 'Comprensibile', 'Segnali espliciti e indicazioni operative prima di agire.')
block(468, 300, 340, 'Condivisibile', 'Riepilogo generato per il responsabile, senza il testo originale e i report URL.')
block(872, 300, 340, 'Riservato', 'Il motore non invia né salva i messaggi. Analisi eseguita nel browser.')
text('L’identità del mittente e la titolarità dell’IBAN richiedono verifiche indipendenti.', 64, 546, 1140, 24, TEAL)
finish('Non è un blocco dei bonifici, una certificazione di autenticità o una promessa di perdite evitate.')

start(7, 'Modello futuro', 'Abbonamento per azienda. Da validare.',
      'Il SaaS è la direzione del prodotto: l’MVP attuale non vende abbonamenti.')
text('600 € / anno', 64, 300, 800, 70, TEAL, True)
text('Ipotesi di ricavo medio annuo per azienda.', 68, 401, 1100, 27)
text('30-60 aziende paganti × 600 € = 18.000-36.000 € ARR', 68, 476, 1110, 31, WHITE, True)
text('Scenario di obiettivo a 12 mesi, non previsione. Ricavi ricorrenti annualizzati, non incassi cumulati.', 68, 552, 1110, 20, MUTED)
finish('Prezzo, conversione e disponibilità a pagare non ancora validati. Nessun TAM/SAM non documentato.')

start(8, 'Scenario competitivo', 'Un aiuto operativo, complementare ai controlli.',
      'Lo spazio competitivo esiste già: la differenziazione deve essere dimostrata.')
block(64, 285, 340, 'Formazione e filtri', 'KnowBe4, Cyber Guru, Microsoft Defender e Proofpoint.<br/><br/>Consapevolezza e protezione della posta.', 23)
block(468, 285, 340, 'Verifica dei pagamenti', 'Trustpair ed Eftsure.<br/><br/>Soluzioni dedicate alla verifica dei fornitori e delle coordinate bancarie.', 23)
block(872, 285, 340, 'Ipotesi FERMO', 'Messaggi in italiano, spiegazioni accessibili e procedure guidate per le PMI.<br/><br/>Da validare sul campo.', 23)
finish('Confronto per categorie, non test comparativo. Fonti ufficiali dei prodotti nel README del pitch.')

start(9, 'Accesso al mercato', 'Partire da tre PMI, prima di scalare.',
      'Obiettivo: capire se FERMO entra davvero nel processo amministrativo.')
block(64, 300, 530, 'Primi utilizzatori', 'Interviste con titolari e responsabili amministrativi.<br/><br/>Pilot su scenari sintetici e messaggi anonimizzati, con consenso e perimetro definito.')
block(670, 300, 530, 'Canali da esplorare', 'Commercialisti, MSP e associazioni territoriali.<br/><br/>Nessuna partnership o adesione al pilot è dichiarata come già acquisita.')
finish('Gli incentivi non sono un presupposto del modello: l’eventuale ammissibilità va verificata separatamente.')

start(10, 'Dall’MVP al SaaS', 'Una base funzionante. Una roadmap esplicita.')
block(64, 285, 530, 'Disponibile oggi', 'Analisi locale e report spiegabile.<br/><br/>Procedure guidate e riepilogo copiabile.<br/><br/>Interfaccia IT/EN, temi e layout responsive.', 25)
block(670, 285, 530, 'Sviluppo futuro', 'Workspace, ruoli e policy aziendali.<br/><br/>Registro verifiche e report aggregati.<br/><br/>Integrazioni con posta e gestionali.', 25)
finish('La panoramica aziendale attuale contiene dati simulati. Login, backend e integrazioni non sono implementati.')

start(11, 'Piano di validazione', 'Tre mesi per misurare utilità e affidabilità.',
      'Piano proposto: nessun risultato di pilot è ancora disponibile.')
block(64, 296, 340, 'Mese 1', 'Interviste e definizione dei casi d’uso.<br/><br/>Misure iniziali: comprensione e tempo di verifica.', 24)
block(468, 296, 340, 'Mese 2', 'Pilot controllato con tre PMI.<br/><br/>Falsi allarmi, segnali mancati e utilità dei passaggi consigliati.', 24)
block(872, 296, 340, 'Mese 3', 'Iterazione sulle regole e confronto con gli utenti.<br/><br/>Disponibilità a pagare e frequenza d’uso.', 24)
finish('Base tecnica verificata: 61 test di regressione superati. Non equivalgono a una misura di efficacia antifrode sul campo.')

start(12, 'Affidabilità e limiti', 'Spiegabile oggi. Da validare sul campo.',
      'Una base tecnica per il prodotto, senza promettere verifiche non effettuate.')
block(64, 285, 530, 'Come funziona', 'Regole deterministiche versionate.<br/><br/>Pesi e soglie configurabili nel codice.<br/><br/>Test su scenari aziendali e regressioni.', 25)
block(670, 285, 530, 'Cosa resta fuori', 'Nessuna verifica bancaria o dell’identità.<br/><br/>Nessun rilevamento di audio o QR.<br/><br/>Nessun feed live di intelligence.', 25)
finish('Interfaccia bilingue; motore configurato per testi italiani. Analisi locale non significa applicazione senza rete.')

start(13, 'Il team e il prossimo passo', 'Cerchiamo tre PMI per un pilot.',
      'Per capire se un controllo in più diventa una buona abitudine prima di pagare.')
block(64, 298, 530, 'Federico Del Pup', 'Magistrale Computer Science, Padova', 22)
block(670, 298, 530, 'Stefano Toneguzzo', 'Triennale Informatica, Udine', 22)
block(64, 438, 530, 'Christian Vianello', 'Triennale Informatica, Udine', 22)
block(670, 438, 530, 'Mattia Guardabascio', 'Ingegneria Aerospaziale, Padova', 22)
finish('Codice e documentazione: github.com/FedeDP7/snap-to-pixel-pages | Un controllo in più. Un rischio in meno.',
       'https://github.com/FedeDP7/snap-to-pixel-pages')
c.save()
print(HERE / 'FERMO-pitch-revisionato.pdf')
