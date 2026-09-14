"""Capture real public screens and the public starter; never use generated UI."""
from pathlib import Path
from datetime import datetime,timezone
from urllib.request import Request,urlopen
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
import hashlib,io,json,os,re,shutil,subprocess,tempfile,threading,time,zipfile
from PIL import Image,ImageGrab
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];A=R/'assets';B=A/'starters/work-01-discovery-contract';O=A/'screenshots/lesson-01';O.mkdir(parents=True,exist_ok=True)
records=[];stamp=datetime.now(timezone.utc).isoformat();chrome=shutil.which('google-chrome');giga='https://gitverse.ru/features/gigacode/install/'
def save(image,id,part,title,caption,source,kind,original=''):
 image=image.convert('RGB');assert image.width>200 and image.height>70
 p=O/(id+'.webp');image.save(p,'WEBP',lossless=True,method=6)
 records.append(dict(id=id,part=part,file=p.name,title=title,caption=caption,sourceUrl=source,kind=kind,originalUrl=original,capturedAt=stamp,width=image.width,height=image.height,sha256=hashlib.sha256(p.read_bytes()).hexdigest(),src=f'assets/screenshots/lesson-01/{p.name}'))
 print('CAPTURE',id,flush=True)
for url,id,part,title,caption,source in [
 ('https://gitverse.ru/docs/gitverse/account-profile/resources/create-profile/img3.png','gitverse-sign-in',1,'Выбор способа входа в GitVerse','Официальный снимок экрана. Выберите GigaID, затем войдите или создайте аккаунт. Это не личный кабинет преподавателя.','https://gitverse.ru/docs/gitverse/account-profile/quick-start'),
 ('https://gitverse.ru/home/_next/static/media/vs_extensions.2d581e6d.png','gigacode-install-vsix',5,'Установка GigaCode из файла','Откройте Extensions (Расширения), нажмите многоточие и выберите Install from VSIX… (Установить из VSIX). Укажите скачанный файл расширения.',giga),
 ('https://gitverse.ru/home/_next/static/media/vs_enable.4aa7b461.png','gigacode-connect',5,'Подключение GigaCode','Нажмите Connect GigaCode (Подключить GigaCode). Подтвердите вход в браузере и вернитесь в редактор.',giga),
 ('https://gitverse.ru/home/_next/static/media/vs_complete.b1f7b1cd.png','gigacode-ready',5,'Панель GigaCode после установки','Официальный скриншот открытого чата. Отправьте свой запрос и проверьте ответ: одна только открытая панель не доказывает работоспособность.',giga),
]:
 with urlopen(Request(url,headers={'User-Agent':'Mozilla/5.0','Referer':source}),timeout=45) as response:data=response.read(15000000)
 image=Image.open(io.BytesIO(data));image.load();save(image,id,part,title,caption,source,'official',url)
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path=chrome,args=['--no-sandbox']);page=browser.new_page(viewport={'width':1280,'height':900},locale='ru-RU')
 for url,id,part,title,caption,text in [
  ('https://git-scm.com/install/windows','git-download',2,'Откуда скачать Git','Настоящая страница загрузки Git. На обычном Windows-компьютере выберите x64 Setup. Номер версии со временем меняется.','Windows'),
  ('https://code.visualstudio.com/Download','vscode-download',3,'Какой Visual Studio Code скачать','В колонке Windows выберите User Installer x64. Это VS Code, а не Visual Studio.','User Installer'),
  ('https://nodejs.org/en/download','node-download',4,'Где выбрать Node.js','Здесь сайт автоматически выбрал Linux. На Windows выберите Windows, x64, ветку 22 LTS и установщик .msi. Команды установки для Linux копировать не нужно.','Download Node.js'),
 ]:
  response=page.goto(url,wait_until='domcontentloaded',timeout=60000);assert response.status<400
  page.get_by_text(text,exact=False).filter(visible=True).first.wait_for(timeout=25000);page.wait_for_timeout(2200);page.evaluate('document.fonts.ready')
  save(Image.open(io.BytesIO(page.screenshot())),id,part,title,caption,page.url,'capture')
 browser.close()
r=subprocess.run(['npm','test'],cwd=B,text=True,capture_output=True,timeout=60);assert r.returncode==0,r.stdout+r.stderr
(O/'test-output.txt').write_text(r.stdout+r.stderr,encoding='utf-8')
with tempfile.TemporaryDirectory() as tmp:
 shell=Path(tmp)/'run.sh';shell.write_text('#!/bin/sh\nprintf "$ npm test\\n"\nnpm test || exit 1\nprintf "\\n$ npm run start\\n"\nnpm run start\n')
 xvfb=subprocess.Popen(['Xvfb',':96','-screen','0','1280x900x24','-nolisten','tcp']);terminal=None
 try:
  time.sleep(1);terminal=subprocess.Popen(['xterm','-geometry','120x32+0+0','-fa','DejaVu Sans Mono','-fs','11','-bg','#171717','-fg','#eeeeee','-e','sh',str(shell)],cwd=B,env={**os.environ,'DISPLAY':':96','PORT':'4173','LANG':'C.UTF-8'})
  for _ in range(100):
   try:
    with urlopen('http://127.0.0.1:4173',timeout=1) as response:
     if response.status==200:break
   except Exception:time.sleep(.2)
  else:raise RuntimeError('Starter did not start')
  time.sleep(1);save(ImageGrab.grab(xdisplay=':96').crop((0,0,1204,650)),'project-terminal',9,'Настоящий запуск тестов и сервера','Реальный терминал Linux с выполненными командами. В Windows оформление другое. Проверяйте 5 пройденных тестов и адрес 127.0.0.1:4173.','','project')
  with sync_playwright() as pw:
   browser=pw.chromium.launch(executable_path=chrome,args=['--no-sandbox']);page=browser.new_page(viewport={'width':1280,'height':900},locale='ru-RU');errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto('http://127.0.0.1:4173',wait_until='networkidle');assert page.locator('#total-count').inner_text()=='12';assert page.locator('#tickets .ticket').count()==12;assert not errors,errors
   save(Image.open(io.BytesIO(page.screenshot(full_page=True))),'project-running',9,'Исходный Campus ServiceDesk','Настоящий запуск проекта из архива первого занятия: 12 заявок. Поиск, база и создание заявок на этом этапе ещё не реализованы.','','project');browser.close()
 finally:
  if terminal:terminal.terminate()
  xvfb.terminate()
assert len(records)==9
(O/'sources.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');shutil.copytree(O,B/'course-docs/screenshots',dirs_exist_ok=True)
guide=['# Настоящие скриншоты занятия 01','','Официальные экраны и снимки реально запущенного проекта.','']
for image in records:
 guide.extend([f"## Часть {image['part']}. {image['title']}",'',image['caption'],'',f"![{image['title']}](screenshots/{image['file']})",''])
 if image['sourceUrl']:guide.extend([f"[Официальный источник]({image['sourceUrl']})",''])
(B/'course-docs/SCREENSHOTS.md').write_text('\n'.join(guide),encoding='utf-8')
p=A/'course.json';course=json.loads(p.read_text(encoding='utf-8'));assert [x['number'] for x in course if not x['locked']]==[1];course[0]['screenshots']=records;p.write_text(json.dumps(course,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
p=A/'starters/manifest.json';manifest=json.loads(p.read_text(encoding='utf-8'));key=course[0]['downloads']['starterKey'];entries=[]
for file in sorted(B.rglob('*')):
 if not file.is_file():continue
 rel=file.relative_to(B);assert '.git' not in rel.parts and file.name!='.env';entry=dict(path=rel.as_posix(),url=file.relative_to(R).as_posix())
 if any(part.startswith('.') for part in rel.parts):entry['content']=file.read_text(encoding='utf-8')
 entries.append(entry)
manifest[key]=entries;manifest['course-all']=[{**e,'path':key+'/'+e['path']} for e in entries];p.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
# Modify only the existing lesson renderer, preserving all access rules.
p=A/'task-page.js';text=p.read_text(encoding='utf-8')
helper='''function realShots(item,title){const part=Number(/^Часть\\s+(\\d+)\\./.exec(title)?.[1]);return(item.screenshots||[]).filter(s=>s.part===part).map(s=>`<figure class="lesson-shot" data-screenshot="${esc(s.id)}"><a class="lesson-shot-link" href="${esc(s.src)}" target="_blank" rel="noopener noreferrer"><img src="${esc(s.src)}" alt="${esc(s.title)}" width="${s.width}" height="${s.height}" loading="lazy" decoding="async"></a><figcaption><b>${esc(s.title)}</b><p>${esc(s.caption)}</p><div>${s.sourceUrl?`<a href="${esc(s.sourceUrl)}" target="_blank" rel="noopener noreferrer">Официальный источник</a>`:'Снимок запущенного учебного проекта'} · <a href="${esc(s.src)}" target="_blank" rel="noopener noreferrer">Открыть крупнее ↗</a></div></figcaption></figure>`).join('');}\n'''
if 'function realShots' not in text:
 assert '${block(s.body)}' in text;text=helper+text.replace('${block(s.body)}','${block(s.body)}${realShots(item,s.title)}')
 start=text.index('function visualGuide(');end=text.index('\n\nexport function renderTask',start)
 text=text[:start]+'''function visualGuide(n){return n===1?`<section class="task-section panel"><p class="eyebrow">Настоящие скриншоты</p><h2>Смотрите рядом с нужным шагом</h2><p>Реальные экраны из официальных инструкций и снимки запуска учебного проекта. Нажмите на изображение, чтобы открыть крупнее. Подписи и источники находятся под снимками.</p><p>Копии этих же изображений есть в архиве: <code>course-docs/SCREENSHOTS.md</code>.</p></section>`:'';}'''+text[end:]
p.write_text(text,encoding='utf-8')
p=A/'style.css';text=p.read_text(encoding='utf-8')
if '.lesson-shot{' not in text:text+='\n.lesson-shot{margin:24px 0 8px;max-width:100%;border:1px solid var(--line);border-radius:18px;overflow:hidden;background:#fff}.lesson-shot-link{display:block;cursor:zoom-in}.lesson-shot img{display:block;width:100%;height:auto}.lesson-shot figcaption{padding:18px 20px;font-size:14px;line-height:1.55}.lesson-shot figcaption>b{display:block;font-size:16px}.lesson-shot figcaption p{margin:7px 0 12px;color:var(--muted)}.lesson-shot figcaption div{font-size:12px}.context-card{min-width:0;overflow-wrap:anywhere}\n'
p.write_text(text,encoding='utf-8')
revision=hashlib.sha256(b''.join(p.read_bytes() for p in sorted(A.glob('*.js'))+[A/'style.css',A/'course.json'])).hexdigest()[:12]
for p in A.glob('*.js'):
 text=p.read_text(encoding='utf-8');text=re.sub(r"(from\s*['\"])(\./[\w-]+\.js)(?:\?[^'\"]*)?",lambda m:f'{m[1]}{m[2]}?v={revision}',text);text=re.sub(r'(assets/[\w/.-]+\.json)\?v=[\w.-]+',lambda m:f'{m[1]}?v={revision}',text);p.write_text(text,encoding='utf-8')
p=R/'index.html';p.write_text(re.sub(r'(assets/(?:app\.js|style\.css))\?v=[\w.-]+',lambda m:f'{m[1]}?v={revision}',p.read_text(encoding='utf-8')),encoding='utf-8')
(A/'screenshot-build.json').write_text(json.dumps(dict(revision=revision,images=9,lesson=1),indent=2)+'\n')
# Test the actual public lesson and the browser-produced ZIP before publishing.
server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(R)));threading.Thread(target=server.serve_forever,daemon=True).start();url=f'http://127.0.0.1:{server.server_port}/';evidence=Path('/tmp/lesson-smoke');evidence.mkdir(exist_ok=True)
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(executable_path=chrome,args=['--no-sandbox'])
  for width in [1440,390]:
   page=browser.new_page(viewport={'width':width,'height':960},locale='ru-RU',accept_downloads=True);errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.goto(url+'#task-1',wait_until='networkidle');assert page.locator('.lesson-shot').count()==9
   for img in page.locator('.lesson-shot img').all():img.scroll_into_view_if_needed();page.wait_for_function('(img)=>img.complete && img.naturalWidth>0',arg=img.element_handle())
   assert not errors,errors;assert not page.evaluate('document.documentElement.scrollWidth>innerWidth'),width
   page.locator('[data-screenshot="gigacode-install-vsix"]').scroll_into_view_if_needed();page.screenshot(path=str(evidence/f'lesson-{width}.png'))
   with page.expect_popup() as event:page.locator('.lesson-shot-link').first.click()
   popup=event.value;popup.wait_for_load_state();assert popup.url.endswith('.webp');popup.close()
   if width==1440:
    with page.expect_download(timeout=60000) as event:page.locator('[data-starter]').first.click()
    archive=evidence/'student-archive.zip';event.value.save_as(str(archive))
    with zipfile.ZipFile(archive) as z:
     assert z.testzip() is None;assert len([n for n in z.namelist() if n.endswith('.webp')])==9
     for name in ['.gitignore','.gitverse/workflows/check.yml','course-docs/SCREENSHOTS.md']:assert name in z.namelist(),name
     for image in records:assert hashlib.sha256(z.read('course-docs/screenshots/'+image['file'])).hexdigest()==image['sha256']
   page.goto(url+'#task-2',wait_until='networkidle');assert 'Материалы пока закрыты' in page.locator('body').inner_text();assert page.locator('.lesson-shot').count()==0;page.close();print('PASS',width,'images, zoom, ZIP, locked future lesson')
  browser.close()
finally:server.shutdown()
(evidence/'result.json').write_text(json.dumps(dict(status='success',images=9,widths=[1440,390],zipVerified=True,futureLessonsLocked=True),indent=2)+'\n')
