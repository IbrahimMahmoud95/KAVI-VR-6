(function(){
    var script = {
 "scrollBarMargin": 2,
 "id": "rootPlayer",
 "horizontalAlign": "left",
 "children": [
  "this.MainViewer"
 ],
 "start": "this.init(); this.set('mute', true)",
 "width": "100%",
 "class": "Player",
 "paddingLeft": 0,
 "scrollBarWidth": 10,
 "defaultVRPointer": "laser",
 "borderSize": 0,
 "minHeight": 20,
 "downloadEnabled": false,
 "layout": "absolute",
 "scripts": {
  "getComponentByName": function(name){  var list = this.getByClassName('UIComponent'); for(var i = 0, count = list.length; i<count; ++i){ var component = list[i]; var data = component.get('data'); if(data != undefined && data.name == name){ return component; } } return undefined; },
  "registerKey": function(key, value){  window[key] = value; },
  "setPanoramaCameraWithCurrentSpot": function(playListItem){  var currentPlayer = this.getActivePlayerWithViewer(this.MainViewer); if(currentPlayer == undefined){ return; } var playerClass = currentPlayer.get('class'); if(playerClass != 'PanoramaPlayer' && playerClass != 'Video360Player'){ return; } var fromMedia = currentPlayer.get('panorama'); if(fromMedia == undefined) { fromMedia = currentPlayer.get('video'); } var panorama = playListItem.get('media'); var newCamera = this.cloneCamera(playListItem.get('camera')); this.setCameraSameSpotAsMedia(newCamera, fromMedia); this.startPanoramaWithCamera(panorama, newCamera); },
  "shareWhatsapp": function(url){  window.open('https://api.whatsapp.com/send/?text=' + encodeURIComponent(url), '_blank'); },
  "playGlobalAudio": function(audio, endCallback){  var endFunction = function(){ audio.unbind('end', endFunction, this); this.stopGlobalAudio(audio); if(endCallback) endCallback(); }; audio = this.getGlobalAudio(audio); var audios = window.currentGlobalAudios; if(!audios){ audios = window.currentGlobalAudios = {}; } audios[audio.get('id')] = audio; if(audio.get('state') == 'playing'){ return audio; } if(!audio.get('loop')){ audio.bind('end', endFunction, this); } audio.play(); return audio; },
  "startPanoramaWithCamera": function(media, camera){  if(window.currentPanoramasWithCameraChanged != undefined && window.currentPanoramasWithCameraChanged.indexOf(media) != -1){ return; } var playLists = this.getByClassName('PlayList'); if(playLists.length == 0) return; var restoreItems = []; for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ var item = items[j]; if(item.get('media') == media && (item.get('class') == 'PanoramaPlayListItem' || item.get('class') == 'Video360PlayListItem')){ restoreItems.push({camera: item.get('camera'), item: item}); item.set('camera', camera); } } } if(restoreItems.length > 0) { if(window.currentPanoramasWithCameraChanged == undefined) { window.currentPanoramasWithCameraChanged = [media]; } else { window.currentPanoramasWithCameraChanged.push(media); } var restoreCameraOnStop = function(){ var index = window.currentPanoramasWithCameraChanged.indexOf(media); if(index != -1) { window.currentPanoramasWithCameraChanged.splice(index, 1); } for (var i = 0; i < restoreItems.length; i++) { restoreItems[i].item.set('camera', restoreItems[i].camera); restoreItems[i].item.unbind('stop', restoreCameraOnStop, this); } }; for (var i = 0; i < restoreItems.length; i++) { restoreItems[i].item.bind('stop', restoreCameraOnStop, this); } } },
  "getMediaFromPlayer": function(player){  switch(player.get('class')){ case 'PanoramaPlayer': return player.get('panorama') || player.get('video'); case 'VideoPlayer': case 'Video360Player': return player.get('video'); case 'PhotoAlbumPlayer': return player.get('photoAlbum'); case 'MapPlayer': return player.get('map'); } },
  "setMediaBehaviour": function(playList, index, mediaDispatcher){  var self = this; var stateChangeFunction = function(event){ if(event.data.state == 'stopped'){ dispose.call(this, true); } }; var onBeginFunction = function() { item.unbind('begin', onBeginFunction, self); var media = item.get('media'); if(media.get('class') != 'Panorama' || (media.get('camera') != undefined && media.get('camera').get('initialSequence') != undefined)){ player.bind('stateChange', stateChangeFunction, self); } }; var changeFunction = function(){ var index = playListDispatcher.get('selectedIndex'); if(index != -1){ indexDispatcher = index; dispose.call(this, false); } }; var disposeCallback = function(){ dispose.call(this, false); }; var dispose = function(forceDispose){ if(!playListDispatcher) return; var media = item.get('media'); if((media.get('class') == 'Video360' || media.get('class') == 'Video') && media.get('loop') == true && !forceDispose) return; playList.set('selectedIndex', -1); if(panoramaSequence && panoramaSequenceIndex != -1){ if(panoramaSequence) { if(panoramaSequenceIndex > 0 && panoramaSequence.get('movements')[panoramaSequenceIndex-1].get('class') == 'TargetPanoramaCameraMovement'){ var initialPosition = camera.get('initialPosition'); var oldYaw = initialPosition.get('yaw'); var oldPitch = initialPosition.get('pitch'); var oldHfov = initialPosition.get('hfov'); var previousMovement = panoramaSequence.get('movements')[panoramaSequenceIndex-1]; initialPosition.set('yaw', previousMovement.get('targetYaw')); initialPosition.set('pitch', previousMovement.get('targetPitch')); initialPosition.set('hfov', previousMovement.get('targetHfov')); var restoreInitialPositionFunction = function(event){ initialPosition.set('yaw', oldYaw); initialPosition.set('pitch', oldPitch); initialPosition.set('hfov', oldHfov); itemDispatcher.unbind('end', restoreInitialPositionFunction, this); }; itemDispatcher.bind('end', restoreInitialPositionFunction, this); } panoramaSequence.set('movementIndex', panoramaSequenceIndex); } } if(player){ item.unbind('begin', onBeginFunction, this); player.unbind('stateChange', stateChangeFunction, this); for(var i = 0; i<buttons.length; ++i) { buttons[i].unbind('click', disposeCallback, this); } } if(sameViewerArea){ var currentMedia = this.getMediaFromPlayer(player); if(currentMedia == undefined || currentMedia == item.get('media')){ playListDispatcher.set('selectedIndex', indexDispatcher); } if(playList != playListDispatcher) playListDispatcher.unbind('change', changeFunction, this); } else{ viewerArea.set('visible', viewerVisibility); } playListDispatcher = undefined; }; var mediaDispatcherByParam = mediaDispatcher != undefined; if(!mediaDispatcher){ var currentIndex = playList.get('selectedIndex'); var currentPlayer = (currentIndex != -1) ? playList.get('items')[playList.get('selectedIndex')].get('player') : this.getActivePlayerWithViewer(this.MainViewer); if(currentPlayer) { mediaDispatcher = this.getMediaFromPlayer(currentPlayer); } } var playListDispatcher = mediaDispatcher ? this.getPlayListWithMedia(mediaDispatcher, true) : undefined; if(!playListDispatcher){ playList.set('selectedIndex', index); return; } var indexDispatcher = playListDispatcher.get('selectedIndex'); if(playList.get('selectedIndex') == index || indexDispatcher == -1){ return; } var item = playList.get('items')[index]; var itemDispatcher = playListDispatcher.get('items')[indexDispatcher]; var player = item.get('player'); var viewerArea = player.get('viewerArea'); var viewerVisibility = viewerArea.get('visible'); var sameViewerArea = viewerArea == itemDispatcher.get('player').get('viewerArea'); if(sameViewerArea){ if(playList != playListDispatcher){ playListDispatcher.set('selectedIndex', -1); playListDispatcher.bind('change', changeFunction, this); } } else{ viewerArea.set('visible', true); } var panoramaSequenceIndex = -1; var panoramaSequence = undefined; var camera = itemDispatcher.get('camera'); if(camera){ panoramaSequence = camera.get('initialSequence'); if(panoramaSequence) { panoramaSequenceIndex = panoramaSequence.get('movementIndex'); } } playList.set('selectedIndex', index); var buttons = []; var addButtons = function(property){ var value = player.get(property); if(value == undefined) return; if(Array.isArray(value)) buttons = buttons.concat(value); else buttons.push(value); }; addButtons('buttonStop'); for(var i = 0; i<buttons.length; ++i) { buttons[i].bind('click', disposeCallback, this); } if(player != itemDispatcher.get('player') || !mediaDispatcherByParam){ item.bind('begin', onBeginFunction, self); } this.executeFunctionWhenChange(playList, index, disposeCallback); },
  "visibleComponentsIfPlayerFlagEnabled": function(components, playerFlag){  var enabled = this.get(playerFlag); for(var i in components){ components[i].set('visible', enabled); } },
  "getActivePlayerWithViewer": function(viewerArea){  var players = this.getByClassName('PanoramaPlayer'); players = players.concat(this.getByClassName('VideoPlayer')); players = players.concat(this.getByClassName('Video360Player')); players = players.concat(this.getByClassName('PhotoAlbumPlayer')); players = players.concat(this.getByClassName('MapPlayer')); var i = players.length; while(i-- > 0){ var player = players[i]; if(player.get('viewerArea') == viewerArea) { var playerClass = player.get('class'); if(playerClass == 'PanoramaPlayer' && (player.get('panorama') != undefined || player.get('video') != undefined)) return player; else if((playerClass == 'VideoPlayer' || playerClass == 'Video360Player') && player.get('video') != undefined) return player; else if(playerClass == 'PhotoAlbumPlayer' && player.get('photoAlbum') != undefined) return player; else if(playerClass == 'MapPlayer' && player.get('map') != undefined) return player; } } return undefined; },
  "getPlayListItems": function(media, player){  var itemClass = (function() { switch(media.get('class')) { case 'Panorama': case 'LivePanorama': case 'HDRPanorama': return 'PanoramaPlayListItem'; case 'Video360': return 'Video360PlayListItem'; case 'PhotoAlbum': return 'PhotoAlbumPlayListItem'; case 'Map': return 'MapPlayListItem'; case 'Video': return 'VideoPlayListItem'; } })(); if (itemClass != undefined) { var items = this.getByClassName(itemClass); for (var i = items.length-1; i>=0; --i) { var item = items[i]; if(item.get('media') != media || (player != undefined && item.get('player') != player)) { items.splice(i, 1); } } return items; } else { return []; } },
  "shareFacebook": function(url){  window.open('https://www.facebook.com/sharer/sharer.php?u=' + url, '_blank'); },
  "updateVideoCues": function(playList, index){  var playListItem = playList.get('items')[index]; var video = playListItem.get('media'); if(video.get('cues').length == 0) return; var player = playListItem.get('player'); var cues = []; var changeFunction = function(){ if(playList.get('selectedIndex') != index){ video.unbind('cueChange', cueChangeFunction, this); playList.unbind('change', changeFunction, this); } }; var cueChangeFunction = function(event){ var activeCues = event.data.activeCues; for(var i = 0, count = cues.length; i<count; ++i){ var cue = cues[i]; if(activeCues.indexOf(cue) == -1 && (cue.get('startTime') > player.get('currentTime') || cue.get('endTime') < player.get('currentTime')+0.5)){ cue.trigger('end'); } } cues = activeCues; }; video.bind('cueChange', cueChangeFunction, this); playList.bind('change', changeFunction, this); },
  "initGA": function(){  var sendFunc = function(category, event, label) { ga('send', 'event', category, event, label); }; var media = this.getByClassName('Panorama'); media = media.concat(this.getByClassName('Video360')); media = media.concat(this.getByClassName('Map')); for(var i = 0, countI = media.length; i<countI; ++i){ var m = media[i]; var mediaLabel = m.get('label'); var overlays = this.getOverlays(m); for(var j = 0, countJ = overlays.length; j<countJ; ++j){ var overlay = overlays[j]; var overlayLabel = overlay.get('data') != undefined ? mediaLabel + ' - ' + overlay.get('data')['label'] : mediaLabel; switch(overlay.get('class')) { case 'HotspotPanoramaOverlay': case 'HotspotMapOverlay': var areas = overlay.get('areas'); for (var z = 0; z<areas.length; ++z) { areas[z].bind('click', sendFunc.bind(this, 'Hotspot', 'click', overlayLabel), this); } break; case 'CeilingCapPanoramaOverlay': case 'TripodCapPanoramaOverlay': overlay.bind('click', sendFunc.bind(this, 'Cap', 'click', overlayLabel), this); break; } } } var components = this.getByClassName('Button'); components = components.concat(this.getByClassName('IconButton')); for(var i = 0, countI = components.length; i<countI; ++i){ var c = components[i]; var componentLabel = c.get('data')['name']; c.bind('click', sendFunc.bind(this, 'Skin', 'click', componentLabel), this); } var items = this.getByClassName('PlayListItem'); var media2Item = {}; for(var i = 0, countI = items.length; i<countI; ++i) { var item = items[i]; var media = item.get('media'); if(!(media.get('id') in media2Item)) { item.bind('begin', sendFunc.bind(this, 'Media', 'play', media.get('label')), this); media2Item[media.get('id')] = item; } } },
  "pauseCurrentPlayers": function(onlyPauseCameraIfPanorama){  var players = this.getCurrentPlayers(); var i = players.length; while(i-- > 0){ var player = players[i]; if(player.get('state') == 'playing') { if(onlyPauseCameraIfPanorama && player.get('class') == 'PanoramaPlayer' && typeof player.get('video') === 'undefined'){ player.pauseCamera(); } else { player.pause(); } } else { players.splice(i, 1); } } return players; },
  "setMainMediaByName": function(name){  var items = this.mainPlayList.get('items'); for(var i = 0; i<items.length; ++i){ var item = items[i]; if(item.get('media').get('label') == name) { this.mainPlayList.set('selectedIndex', i); return item; } } },
  "changePlayListWithSameSpot": function(playList, newIndex){  var currentIndex = playList.get('selectedIndex'); if (currentIndex >= 0 && newIndex >= 0 && currentIndex != newIndex) { var currentItem = playList.get('items')[currentIndex]; var newItem = playList.get('items')[newIndex]; var currentPlayer = currentItem.get('player'); var newPlayer = newItem.get('player'); if ((currentPlayer.get('class') == 'PanoramaPlayer' || currentPlayer.get('class') == 'Video360Player') && (newPlayer.get('class') == 'PanoramaPlayer' || newPlayer.get('class') == 'Video360Player')) { var newCamera = this.cloneCamera(newItem.get('camera')); this.setCameraSameSpotAsMedia(newCamera, currentItem.get('media')); this.startPanoramaWithCamera(newItem.get('media'), newCamera); } } },
  "showWindow": function(w, autoCloseMilliSeconds, containsAudio){  if(w.get('visible') == true){ return; } var closeFunction = function(){ clearAutoClose(); this.resumePlayers(playersPaused, !containsAudio); w.unbind('close', closeFunction, this); }; var clearAutoClose = function(){ w.unbind('click', clearAutoClose, this); if(timeoutID != undefined){ clearTimeout(timeoutID); } }; var timeoutID = undefined; if(autoCloseMilliSeconds){ var autoCloseFunction = function(){ w.hide(); }; w.bind('click', clearAutoClose, this); timeoutID = setTimeout(autoCloseFunction, autoCloseMilliSeconds); } var playersPaused = this.pauseCurrentPlayers(!containsAudio); w.bind('close', closeFunction, this); w.show(this, true); },
  "setMainMediaByIndex": function(index){  var item = undefined; if(index >= 0 && index < this.mainPlayList.get('items').length){ this.mainPlayList.set('selectedIndex', index); item = this.mainPlayList.get('items')[index]; } return item; },
  "getMediaByName": function(name){  var list = this.getByClassName('Media'); for(var i = 0, count = list.length; i<count; ++i){ var media = list[i]; if((media.get('class') == 'Audio' && media.get('data').label == name) || media.get('label') == name){ return media; } } return undefined; },
  "changeBackgroundWhilePlay": function(playList, index, color){  var stopFunction = function(event){ playListItem.unbind('stop', stopFunction, this); if((color == viewerArea.get('backgroundColor')) && (colorRatios == viewerArea.get('backgroundColorRatios'))){ viewerArea.set('backgroundColor', backgroundColorBackup); viewerArea.set('backgroundColorRatios', backgroundColorRatiosBackup); } }; var playListItem = playList.get('items')[index]; var player = playListItem.get('player'); var viewerArea = player.get('viewerArea'); var backgroundColorBackup = viewerArea.get('backgroundColor'); var backgroundColorRatiosBackup = viewerArea.get('backgroundColorRatios'); var colorRatios = [0]; if((color != backgroundColorBackup) || (colorRatios != backgroundColorRatiosBackup)){ viewerArea.set('backgroundColor', color); viewerArea.set('backgroundColorRatios', colorRatios); playListItem.bind('stop', stopFunction, this); } },
  "updateMediaLabelFromPlayList": function(playList, htmlText, playListItemStopToDispose){  var changeFunction = function(){ var index = playList.get('selectedIndex'); if(index >= 0){ var beginFunction = function(){ playListItem.unbind('begin', beginFunction); setMediaLabel(index); }; var setMediaLabel = function(index){ var media = playListItem.get('media'); var text = media.get('data'); if(!text) text = media.get('label'); setHtml(text); }; var setHtml = function(text){ if(text !== undefined) { htmlText.set('html', '<div style=\"text-align:left\"><SPAN STYLE=\"color:#FFFFFF;font-size:12px;font-family:Verdana\"><span color=\"white\" font-family=\"Verdana\" font-size=\"12px\">' + text + '</SPAN></div>'); } else { htmlText.set('html', ''); } }; var playListItem = playList.get('items')[index]; if(htmlText.get('html')){ setHtml('Loading...'); playListItem.bind('begin', beginFunction); } else{ setMediaLabel(index); } } }; var disposeFunction = function(){ htmlText.set('html', undefined); playList.unbind('change', changeFunction, this); playListItemStopToDispose.unbind('stop', disposeFunction, this); }; if(playListItemStopToDispose){ playListItemStopToDispose.bind('stop', disposeFunction, this); } playList.bind('change', changeFunction, this); changeFunction(); },
  "loadFromCurrentMediaPlayList": function(playList, delta){  var currentIndex = playList.get('selectedIndex'); var totalItems = playList.get('items').length; var newIndex = (currentIndex + delta) % totalItems; while(newIndex < 0){ newIndex = totalItems + newIndex; }; if(currentIndex != newIndex){ playList.set('selectedIndex', newIndex); } },
  "getPixels": function(value){  var result = new RegExp('((\\+|\\-)?\\d+(\\.\\d*)?)(px|vw|vh|vmin|vmax)?', 'i').exec(value); if (result == undefined) { return 0; } var num = parseFloat(result[1]); var unit = result[4]; var vw = this.rootPlayer.get('actualWidth') / 100; var vh = this.rootPlayer.get('actualHeight') / 100; switch(unit) { case 'vw': return num * vw; case 'vh': return num * vh; case 'vmin': return num * Math.min(vw, vh); case 'vmax': return num * Math.max(vw, vh); default: return num; } },
  "resumePlayers": function(players, onlyResumeCameraIfPanorama){  for(var i = 0; i<players.length; ++i){ var player = players[i]; if(onlyResumeCameraIfPanorama && player.get('class') == 'PanoramaPlayer' && typeof player.get('video') === 'undefined'){ player.resumeCamera(); } else{ player.play(); } } },
  "showPopupPanoramaVideoOverlay": function(popupPanoramaOverlay, closeButtonProperties, stopAudios){  var self = this; var showEndFunction = function() { popupPanoramaOverlay.unbind('showEnd', showEndFunction); closeButton.bind('click', hideFunction, this); setCloseButtonPosition(); closeButton.set('visible', true); }; var endFunction = function() { if(!popupPanoramaOverlay.get('loop')) hideFunction(); }; var hideFunction = function() { self.MainViewer.set('toolTipEnabled', true); popupPanoramaOverlay.set('visible', false); closeButton.set('visible', false); closeButton.unbind('click', hideFunction, self); popupPanoramaOverlay.unbind('end', endFunction, self); popupPanoramaOverlay.unbind('hideEnd', hideFunction, self, true); self.resumePlayers(playersPaused, true); if(stopAudios) { self.resumeGlobalAudios(); } }; var setCloseButtonPosition = function() { var right = 10; var top = 10; closeButton.set('right', right); closeButton.set('top', top); }; this.MainViewer.set('toolTipEnabled', false); var closeButton = this.closeButtonPopupPanorama; if(closeButtonProperties){ for(var key in closeButtonProperties){ closeButton.set(key, closeButtonProperties[key]); } } var playersPaused = this.pauseCurrentPlayers(true); if(stopAudios) { this.pauseGlobalAudios(); } popupPanoramaOverlay.bind('end', endFunction, this, true); popupPanoramaOverlay.bind('showEnd', showEndFunction, this, true); popupPanoramaOverlay.bind('hideEnd', hideFunction, this, true); popupPanoramaOverlay.set('visible', true); },
  "playGlobalAudioWhilePlay": function(playList, index, audio, endCallback){  var changeFunction = function(event){ if(event.data.previousSelectedIndex == index){ this.stopGlobalAudio(audio); if(isPanorama) { var media = playListItem.get('media'); var audios = media.get('audios'); audios.splice(audios.indexOf(audio), 1); media.set('audios', audios); } playList.unbind('change', changeFunction, this); if(endCallback) endCallback(); } }; var audios = window.currentGlobalAudios; if(audios && audio.get('id') in audios){ audio = audios[audio.get('id')]; if(audio.get('state') != 'playing'){ audio.play(); } return audio; } playList.bind('change', changeFunction, this); var playListItem = playList.get('items')[index]; var isPanorama = playListItem.get('class') == 'PanoramaPlayListItem'; if(isPanorama) { var media = playListItem.get('media'); var audios = (media.get('audios') || []).slice(); if(audio.get('class') == 'MediaAudio') { var panoramaAudio = this.rootPlayer.createInstance('PanoramaAudio'); panoramaAudio.set('autoplay', false); panoramaAudio.set('audio', audio.get('audio')); panoramaAudio.set('loop', audio.get('loop')); panoramaAudio.set('id', audio.get('id')); var stateChangeFunctions = audio.getBindings('stateChange'); for(var i = 0; i<stateChangeFunctions.length; ++i){ var f = stateChangeFunctions[i]; if(typeof f == 'string') f = new Function('event', f); panoramaAudio.bind('stateChange', f, this); } audio = panoramaAudio; } audios.push(audio); media.set('audios', audios); } return this.playGlobalAudio(audio, endCallback); },
  "init": function(){  if(!Object.hasOwnProperty('values')) { Object.values = function(o){ return Object.keys(o).map(function(e) { return o[e]; }); }; } var history = this.get('data')['history']; var playListChangeFunc = function(e){ var playList = e.source; var index = playList.get('selectedIndex'); if(index < 0) return; var id = playList.get('id'); if(!history.hasOwnProperty(id)) history[id] = new HistoryData(playList); history[id].add(index); }; var playLists = this.getByClassName('PlayList'); for(var i = 0, count = playLists.length; i<count; ++i) { var playList = playLists[i]; playList.bind('change', playListChangeFunc, this); } },
  "setEndToItemIndex": function(playList, fromIndex, toIndex){  var endFunction = function(){ if(playList.get('selectedIndex') == fromIndex) playList.set('selectedIndex', toIndex); }; this.executeFunctionWhenChange(playList, fromIndex, endFunction); },
  "executeFunctionWhenChange": function(playList, index, endFunction, changeFunction){  var endObject = undefined; var changePlayListFunction = function(event){ if(event.data.previousSelectedIndex == index){ if(changeFunction) changeFunction.call(this); if(endFunction && endObject) endObject.unbind('end', endFunction, this); playList.unbind('change', changePlayListFunction, this); } }; if(endFunction){ var playListItem = playList.get('items')[index]; if(playListItem.get('class') == 'PanoramaPlayListItem'){ var camera = playListItem.get('camera'); if(camera != undefined) endObject = camera.get('initialSequence'); if(endObject == undefined) endObject = camera.get('idleSequence'); } else{ endObject = playListItem.get('media'); } if(endObject){ endObject.bind('end', endFunction, this); } } playList.bind('change', changePlayListFunction, this); },
  "triggerOverlay": function(overlay, eventName){  if(overlay.get('areas') != undefined) { var areas = overlay.get('areas'); for(var i = 0; i<areas.length; ++i) { areas[i].trigger(eventName); } } else { overlay.trigger(eventName); } },
  "setStartTimeVideoSync": function(video, player){  this.setStartTimeVideo(video, player.get('currentTime')); },
  "getGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios != undefined && audio.get('id') in audios){ audio = audios[audio.get('id')]; } return audio; },
  "getCurrentPlayers": function(){  var players = this.getByClassName('PanoramaPlayer'); players = players.concat(this.getByClassName('VideoPlayer')); players = players.concat(this.getByClassName('Video360Player')); players = players.concat(this.getByClassName('PhotoAlbumPlayer')); return players; },
  "pauseGlobalAudios": function(caller, exclude){  if (window.pauseGlobalAudiosState == undefined) window.pauseGlobalAudiosState = {}; if (window.pauseGlobalAudiosList == undefined) window.pauseGlobalAudiosList = []; if (caller in window.pauseGlobalAudiosState) { return; } var audios = this.getByClassName('Audio').concat(this.getByClassName('VideoPanoramaOverlay')); if (window.currentGlobalAudios != undefined) audios = audios.concat(Object.values(window.currentGlobalAudios)); var audiosPaused = []; var values = Object.values(window.pauseGlobalAudiosState); for (var i = 0, count = values.length; i<count; ++i) { var objAudios = values[i]; for (var j = 0; j<objAudios.length; ++j) { var a = objAudios[j]; if(audiosPaused.indexOf(a) == -1) audiosPaused.push(a); } } window.pauseGlobalAudiosState[caller] = audiosPaused; for (var i = 0, count = audios.length; i < count; ++i) { var a = audios[i]; if (a.get('state') == 'playing' && (exclude == undefined || exclude.indexOf(a) == -1)) { a.pause(); audiosPaused.push(a); } } },
  "getCurrentPlayerWithMedia": function(media){  var playerClass = undefined; var mediaPropertyName = undefined; switch(media.get('class')) { case 'Panorama': case 'LivePanorama': case 'HDRPanorama': playerClass = 'PanoramaPlayer'; mediaPropertyName = 'panorama'; break; case 'Video360': playerClass = 'PanoramaPlayer'; mediaPropertyName = 'video'; break; case 'PhotoAlbum': playerClass = 'PhotoAlbumPlayer'; mediaPropertyName = 'photoAlbum'; break; case 'Map': playerClass = 'MapPlayer'; mediaPropertyName = 'map'; break; case 'Video': playerClass = 'VideoPlayer'; mediaPropertyName = 'video'; break; }; if(playerClass != undefined) { var players = this.getByClassName(playerClass); for(var i = 0; i<players.length; ++i){ var player = players[i]; if(player.get(mediaPropertyName) == media) { return player; } } } else { return undefined; } },
  "getPlayListItemByMedia": function(playList, media){  var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ var item = items[j]; if(item.get('media') == media) return item; } return undefined; },
  "playAudioList": function(audios){  if(audios.length == 0) return; var currentAudioCount = -1; var currentAudio; var playGlobalAudioFunction = this.playGlobalAudio; var playNext = function(){ if(++currentAudioCount >= audios.length) currentAudioCount = 0; currentAudio = audios[currentAudioCount]; playGlobalAudioFunction(currentAudio, playNext); }; playNext(); },
  "fixTogglePlayPauseButton": function(player){  var state = player.get('state'); var buttons = player.get('buttonPlayPause'); if(typeof buttons !== 'undefined' && player.get('state') == 'playing'){ if(!Array.isArray(buttons)) buttons = [buttons]; for(var i = 0; i<buttons.length; ++i) buttons[i].set('pressed', true); } },
  "resumeGlobalAudios": function(caller){  if (window.pauseGlobalAudiosState == undefined || !(caller in window.pauseGlobalAudiosState)) return; var audiosPaused = window.pauseGlobalAudiosState[caller]; delete window.pauseGlobalAudiosState[caller]; var values = Object.values(window.pauseGlobalAudiosState); for (var i = 0, count = values.length; i<count; ++i) { var objAudios = values[i]; for (var j = audiosPaused.length-1; j>=0; --j) { var a = audiosPaused[j]; if(objAudios.indexOf(a) != -1) audiosPaused.splice(j, 1); } } for (var i = 0, count = audiosPaused.length; i<count; ++i) { var a = audiosPaused[i]; if (a.get('state') == 'paused') a.play(); } },
  "getPlayListWithMedia": function(media, onlySelected){  var playLists = this.getByClassName('PlayList'); for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; if(onlySelected && playList.get('selectedIndex') == -1) continue; if(this.getPlayListItemByMedia(playList, media) != undefined) return playList; } return undefined; },
  "showPopupImage": function(image, toggleImage, customWidth, customHeight, showEffect, hideEffect, closeButtonProperties, autoCloseMilliSeconds, audio, stopBackgroundAudio, loadedCallback, hideCallback){  var self = this; var closed = false; var playerClickFunction = function() { zoomImage.unbind('loaded', loadedFunction, self); hideFunction(); }; var clearAutoClose = function(){ zoomImage.unbind('click', clearAutoClose, this); if(timeoutID != undefined){ clearTimeout(timeoutID); } }; var resizeFunction = function(){ setTimeout(setCloseButtonPosition, 0); }; var loadedFunction = function(){ self.unbind('click', playerClickFunction, self); veil.set('visible', true); setCloseButtonPosition(); closeButton.set('visible', true); zoomImage.unbind('loaded', loadedFunction, this); zoomImage.bind('userInteractionStart', userInteractionStartFunction, this); zoomImage.bind('userInteractionEnd', userInteractionEndFunction, this); zoomImage.bind('resize', resizeFunction, this); timeoutID = setTimeout(timeoutFunction, 200); }; var timeoutFunction = function(){ timeoutID = undefined; if(autoCloseMilliSeconds){ var autoCloseFunction = function(){ hideFunction(); }; zoomImage.bind('click', clearAutoClose, this); timeoutID = setTimeout(autoCloseFunction, autoCloseMilliSeconds); } zoomImage.bind('backgroundClick', hideFunction, this); if(toggleImage) { zoomImage.bind('click', toggleFunction, this); zoomImage.set('imageCursor', 'hand'); } closeButton.bind('click', hideFunction, this); if(loadedCallback) loadedCallback(); }; var hideFunction = function() { self.MainViewer.set('toolTipEnabled', true); closed = true; if(timeoutID) clearTimeout(timeoutID); if (timeoutUserInteractionID) clearTimeout(timeoutUserInteractionID); if(autoCloseMilliSeconds) clearAutoClose(); if(hideCallback) hideCallback(); zoomImage.set('visible', false); if(hideEffect && hideEffect.get('duration') > 0){ hideEffect.bind('end', endEffectFunction, this); } else{ zoomImage.set('image', null); } closeButton.set('visible', false); veil.set('visible', false); self.unbind('click', playerClickFunction, self); zoomImage.unbind('backgroundClick', hideFunction, this); zoomImage.unbind('userInteractionStart', userInteractionStartFunction, this); zoomImage.unbind('userInteractionEnd', userInteractionEndFunction, this, true); zoomImage.unbind('resize', resizeFunction, this); if(toggleImage) { zoomImage.unbind('click', toggleFunction, this); zoomImage.set('cursor', 'default'); } closeButton.unbind('click', hideFunction, this); self.resumePlayers(playersPaused, audio == null || stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ self.resumeGlobalAudios(); } self.stopGlobalAudio(audio); } }; var endEffectFunction = function() { zoomImage.set('image', null); hideEffect.unbind('end', endEffectFunction, this); }; var toggleFunction = function() { zoomImage.set('image', isToggleVisible() ? image : toggleImage); }; var isToggleVisible = function() { return zoomImage.get('image') == toggleImage; }; var setCloseButtonPosition = function() { var right = zoomImage.get('actualWidth') - zoomImage.get('imageLeft') - zoomImage.get('imageWidth') + 10; var top = zoomImage.get('imageTop') + 10; if(right < 10) right = 10; if(top < 10) top = 10; closeButton.set('right', right); closeButton.set('top', top); }; var userInteractionStartFunction = function() { if(timeoutUserInteractionID){ clearTimeout(timeoutUserInteractionID); timeoutUserInteractionID = undefined; } else{ closeButton.set('visible', false); } }; var userInteractionEndFunction = function() { if(!closed){ timeoutUserInteractionID = setTimeout(userInteractionTimeoutFunction, 300); } }; var userInteractionTimeoutFunction = function() { timeoutUserInteractionID = undefined; closeButton.set('visible', true); setCloseButtonPosition(); }; this.MainViewer.set('toolTipEnabled', false); var veil = this.veilPopupPanorama; var zoomImage = this.zoomImagePopupPanorama; var closeButton = this.closeButtonPopupPanorama; if(closeButtonProperties){ for(var key in closeButtonProperties){ closeButton.set(key, closeButtonProperties[key]); } } var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ this.pauseGlobalAudios(); } this.playGlobalAudio(audio); } var timeoutID = undefined; var timeoutUserInteractionID = undefined; zoomImage.bind('loaded', loadedFunction, this); setTimeout(function(){ self.bind('click', playerClickFunction, self, false); }, 0); zoomImage.set('image', image); zoomImage.set('customWidth', customWidth); zoomImage.set('customHeight', customHeight); zoomImage.set('showEffect', showEffect); zoomImage.set('hideEffect', hideEffect); zoomImage.set('visible', true); return zoomImage; },
  "setComponentVisibility": function(component, visible, applyAt, effect, propertyEffect, ignoreClearTimeout){  var keepVisibility = this.getKey('keepVisibility_' + component.get('id')); if(keepVisibility) return; this.unregisterKey('visibility_'+component.get('id')); var changeVisibility = function(){ if(effect && propertyEffect){ component.set(propertyEffect, effect); } component.set('visible', visible); if(component.get('class') == 'ViewerArea'){ try{ if(visible) component.restart(); else if(component.get('playbackState') == 'playing') component.pause(); } catch(e){}; } }; var effectTimeoutName = 'effectTimeout_'+component.get('id'); if(!ignoreClearTimeout && window.hasOwnProperty(effectTimeoutName)){ var effectTimeout = window[effectTimeoutName]; if(effectTimeout instanceof Array){ for(var i=0; i<effectTimeout.length; i++){ clearTimeout(effectTimeout[i]) } }else{ clearTimeout(effectTimeout); } delete window[effectTimeoutName]; } else if(visible == component.get('visible') && !ignoreClearTimeout) return; if(applyAt && applyAt > 0){ var effectTimeout = setTimeout(function(){ if(window[effectTimeoutName] instanceof Array) { var arrayTimeoutVal = window[effectTimeoutName]; var index = arrayTimeoutVal.indexOf(effectTimeout); arrayTimeoutVal.splice(index, 1); if(arrayTimeoutVal.length == 0){ delete window[effectTimeoutName]; } }else{ delete window[effectTimeoutName]; } changeVisibility(); }, applyAt); if(window.hasOwnProperty(effectTimeoutName)){ window[effectTimeoutName] = [window[effectTimeoutName], effectTimeout]; }else{ window[effectTimeoutName] = effectTimeout; } } else{ changeVisibility(); } },
  "getMediaWidth": function(media){  switch(media.get('class')){ case 'Video360': var res = media.get('video'); if(res instanceof Array){ var maxW=0; for(var i=0; i<res.length; i++){ var r = res[i]; if(r.get('width') > maxW) maxW = r.get('width'); } return maxW; }else{ return r.get('width') } default: return media.get('width'); } },
  "historyGoBack": function(playList){  var history = this.get('data')['history'][playList.get('id')]; if(history != undefined) { history.back(); } },
  "getOverlays": function(media){  switch(media.get('class')){ case 'Panorama': var overlays = media.get('overlays').concat() || []; var frames = media.get('frames'); for(var j = 0; j<frames.length; ++j){ overlays = overlays.concat(frames[j].get('overlays') || []); } return overlays; case 'Video360': case 'Map': return media.get('overlays') || []; default: return []; } },
  "setCameraSameSpotAsMedia": function(camera, media){  var player = this.getCurrentPlayerWithMedia(media); if(player != undefined) { var position = camera.get('initialPosition'); position.set('yaw', player.get('yaw')); position.set('pitch', player.get('pitch')); position.set('hfov', player.get('hfov')); } },
  "loopAlbum": function(playList, index){  var playListItem = playList.get('items')[index]; var player = playListItem.get('player'); var loopFunction = function(){ player.play(); }; this.executeFunctionWhenChange(playList, index, loopFunction); },
  "stopAndGoCamera": function(camera, ms){  var sequence = camera.get('initialSequence'); sequence.pause(); var timeoutFunction = function(){ sequence.play(); }; setTimeout(timeoutFunction, ms); },
  "keepComponentVisibility": function(component, keep){  var key = 'keepVisibility_' + component.get('id'); var value = this.getKey(key); if(value == undefined && keep) { this.registerKey(key, keep); } else if(value != undefined && !keep) { this.unregisterKey(key); } },
  "stopGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios){ audio = audios[audio.get('id')]; if(audio){ delete audios[audio.get('id')]; if(Object.keys(audios).length == 0){ window.currentGlobalAudios = undefined; } } } if(audio) audio.stop(); },
  "setPanoramaCameraWithSpot": function(playListItem, yaw, pitch){  var panorama = playListItem.get('media'); var newCamera = this.cloneCamera(playListItem.get('camera')); var initialPosition = newCamera.get('initialPosition'); initialPosition.set('yaw', yaw); initialPosition.set('pitch', pitch); this.startPanoramaWithCamera(panorama, newCamera); },
  "shareTwitter": function(url){  window.open('https://twitter.com/intent/tweet?source=webclient&url=' + url, '_blank'); },
  "setStartTimeVideo": function(video, time){  var items = this.getPlayListItems(video); var startTimeBackup = []; var restoreStartTimeFunc = function() { for(var i = 0; i<items.length; ++i){ var item = items[i]; item.set('startTime', startTimeBackup[i]); item.unbind('stop', restoreStartTimeFunc, this); } }; for(var i = 0; i<items.length; ++i) { var item = items[i]; var player = item.get('player'); if(player.get('video') == video && player.get('state') == 'playing') { player.seek(time); } else { startTimeBackup.push(item.get('startTime')); item.set('startTime', time); item.bind('stop', restoreStartTimeFunc, this); } } },
  "existsKey": function(key){  return key in window; },
  "getPanoramaOverlayByName": function(panorama, name){  var overlays = this.getOverlays(panorama); for(var i = 0, count = overlays.length; i<count; ++i){ var overlay = overlays[i]; var data = overlay.get('data'); if(data != undefined && data.label == name){ return overlay; } } return undefined; },
  "autotriggerAtStart": function(playList, callback, once){  var onChange = function(event){ callback(); if(once == true) playList.unbind('change', onChange, this); }; playList.bind('change', onChange, this); },
  "historyGoForward": function(playList){  var history = this.get('data')['history'][playList.get('id')]; if(history != undefined) { history.forward(); } },
  "getKey": function(key){  return window[key]; },
  "pauseGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios){ audio = audios[audio.get('id')]; } if(audio.get('state') == 'playing') audio.pause(); },
  "showPopupPanoramaOverlay": function(popupPanoramaOverlay, closeButtonProperties, imageHD, toggleImage, toggleImageHD, autoCloseMilliSeconds, audio, stopBackgroundAudio){  var self = this; this.MainViewer.set('toolTipEnabled', false); var cardboardEnabled = this.isCardboardViewMode(); if(!cardboardEnabled) { var zoomImage = this.zoomImagePopupPanorama; var showDuration = popupPanoramaOverlay.get('showDuration'); var hideDuration = popupPanoramaOverlay.get('hideDuration'); var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); var popupMaxWidthBackup = popupPanoramaOverlay.get('popupMaxWidth'); var popupMaxHeightBackup = popupPanoramaOverlay.get('popupMaxHeight'); var showEndFunction = function() { var loadedFunction = function(){ if(!self.isCardboardViewMode()) popupPanoramaOverlay.set('visible', false); }; popupPanoramaOverlay.unbind('showEnd', showEndFunction, self); popupPanoramaOverlay.set('showDuration', 1); popupPanoramaOverlay.set('hideDuration', 1); self.showPopupImage(imageHD, toggleImageHD, popupPanoramaOverlay.get('popupMaxWidth'), popupPanoramaOverlay.get('popupMaxHeight'), null, null, closeButtonProperties, autoCloseMilliSeconds, audio, stopBackgroundAudio, loadedFunction, hideFunction); }; var hideFunction = function() { var restoreShowDurationFunction = function(){ popupPanoramaOverlay.unbind('showEnd', restoreShowDurationFunction, self); popupPanoramaOverlay.set('visible', false); popupPanoramaOverlay.set('showDuration', showDuration); popupPanoramaOverlay.set('popupMaxWidth', popupMaxWidthBackup); popupPanoramaOverlay.set('popupMaxHeight', popupMaxHeightBackup); }; self.resumePlayers(playersPaused, audio == null || !stopBackgroundAudio); var currentWidth = zoomImage.get('imageWidth'); var currentHeight = zoomImage.get('imageHeight'); popupPanoramaOverlay.bind('showEnd', restoreShowDurationFunction, self, true); popupPanoramaOverlay.set('showDuration', 1); popupPanoramaOverlay.set('hideDuration', hideDuration); popupPanoramaOverlay.set('popupMaxWidth', currentWidth); popupPanoramaOverlay.set('popupMaxHeight', currentHeight); if(popupPanoramaOverlay.get('visible')) restoreShowDurationFunction(); else popupPanoramaOverlay.set('visible', true); self.MainViewer.set('toolTipEnabled', true); }; if(!imageHD){ imageHD = popupPanoramaOverlay.get('image'); } if(!toggleImageHD && toggleImage){ toggleImageHD = toggleImage; } popupPanoramaOverlay.bind('showEnd', showEndFunction, this, true); } else { var hideEndFunction = function() { self.resumePlayers(playersPaused, audio == null || stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ self.resumeGlobalAudios(); } self.stopGlobalAudio(audio); } popupPanoramaOverlay.unbind('hideEnd', hideEndFunction, self); self.MainViewer.set('toolTipEnabled', true); }; var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ this.pauseGlobalAudios(); } this.playGlobalAudio(audio); } popupPanoramaOverlay.bind('hideEnd', hideEndFunction, this, true); } popupPanoramaOverlay.set('visible', true); },
  "unregisterKey": function(key){  delete window[key]; },
  "syncPlaylists": function(playLists){  var changeToMedia = function(media, playListDispatched){ for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; if(playList != playListDispatched){ var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ if(items[j].get('media') == media){ if(playList.get('selectedIndex') != j){ playList.set('selectedIndex', j); } break; } } } } }; var changeFunction = function(event){ var playListDispatched = event.source; var selectedIndex = playListDispatched.get('selectedIndex'); if(selectedIndex < 0) return; var media = playListDispatched.get('items')[selectedIndex].get('media'); changeToMedia(media, playListDispatched); }; var mapPlayerChangeFunction = function(event){ var panoramaMapLocation = event.source.get('panoramaMapLocation'); if(panoramaMapLocation){ var map = panoramaMapLocation.get('map'); changeToMedia(map); } }; for(var i = 0, count = playLists.length; i<count; ++i){ playLists[i].bind('change', changeFunction, this); } var mapPlayers = this.getByClassName('MapPlayer'); for(var i = 0, count = mapPlayers.length; i<count; ++i){ mapPlayers[i].bind('panoramaMapLocation_change', mapPlayerChangeFunction, this); } },
  "isCardboardViewMode": function(){  var players = this.getByClassName('PanoramaPlayer'); return players.length > 0 && players[0].get('viewMode') == 'cardboard'; },
  "setOverlayBehaviour": function(overlay, media, action){  var executeFunc = function() { switch(action){ case 'triggerClick': this.triggerOverlay(overlay, 'click'); break; case 'stop': case 'play': case 'pause': overlay[action](); break; case 'togglePlayPause': case 'togglePlayStop': if(overlay.get('state') == 'playing') overlay[action == 'togglePlayPause' ? 'pause' : 'stop'](); else overlay.play(); break; } if(window.overlaysDispatched == undefined) window.overlaysDispatched = {}; var id = overlay.get('id'); window.overlaysDispatched[id] = true; setTimeout(function(){ delete window.overlaysDispatched[id]; }, 2000); }; if(window.overlaysDispatched != undefined && overlay.get('id') in window.overlaysDispatched) return; var playList = this.getPlayListWithMedia(media, true); if(playList != undefined){ var item = this.getPlayListItemByMedia(playList, media); if(playList.get('items').indexOf(item) != playList.get('selectedIndex')){ var beginFunc = function(e){ item.unbind('begin', beginFunc, this); executeFunc.call(this); }; item.bind('begin', beginFunc, this); return; } } executeFunc.call(this); },
  "setMapLocation": function(panoramaPlayListItem, mapPlayer){  var resetFunction = function(){ panoramaPlayListItem.unbind('stop', resetFunction, this); player.set('mapPlayer', null); }; panoramaPlayListItem.bind('stop', resetFunction, this); var player = panoramaPlayListItem.get('player'); player.set('mapPlayer', mapPlayer); },
  "pauseGlobalAudiosWhilePlayItem": function(playList, index, exclude){  var self = this; var item = playList.get('items')[index]; var media = item.get('media'); var player = item.get('player'); var caller = media.get('id'); var endFunc = function(){ if(playList.get('selectedIndex') != index) { if(hasState){ player.unbind('stateChange', stateChangeFunc, self); } self.resumeGlobalAudios(caller); } }; var stateChangeFunc = function(event){ var state = event.data.state; if(state == 'stopped'){ this.resumeGlobalAudios(caller); } else if(state == 'playing'){ this.pauseGlobalAudios(caller, exclude); } }; var mediaClass = media.get('class'); var hasState = mediaClass == 'Video360' || mediaClass == 'Video'; if(hasState){ player.bind('stateChange', stateChangeFunc, this); } this.pauseGlobalAudios(caller, exclude); this.executeFunctionWhenChange(playList, index, endFunc, endFunc); },
  "showComponentsWhileMouseOver": function(parentComponent, components, durationVisibleWhileOut){  var setVisibility = function(visible){ for(var i = 0, length = components.length; i<length; i++){ var component = components[i]; if(component.get('class') == 'HTMLText' && (component.get('html') == '' || component.get('html') == undefined)) { continue; } component.set('visible', visible); } }; if (this.rootPlayer.get('touchDevice') == true){ setVisibility(true); } else { var timeoutID = -1; var rollOverFunction = function(){ setVisibility(true); if(timeoutID >= 0) clearTimeout(timeoutID); parentComponent.unbind('rollOver', rollOverFunction, this); parentComponent.bind('rollOut', rollOutFunction, this); }; var rollOutFunction = function(){ var timeoutFunction = function(){ setVisibility(false); parentComponent.unbind('rollOver', rollOverFunction, this); }; parentComponent.unbind('rollOut', rollOutFunction, this); parentComponent.bind('rollOver', rollOverFunction, this); timeoutID = setTimeout(timeoutFunction, durationVisibleWhileOut); }; parentComponent.bind('rollOver', rollOverFunction, this); } },
  "showPopupMedia": function(w, media, playList, popupMaxWidth, popupMaxHeight, autoCloseWhenFinished, stopAudios){  var self = this; var closeFunction = function(){ playList.set('selectedIndex', -1); self.MainViewer.set('toolTipEnabled', true); if(stopAudios) { self.resumeGlobalAudios(); } this.resumePlayers(playersPaused, !stopAudios); if(isVideo) { this.unbind('resize', resizeFunction, this); } w.unbind('close', closeFunction, this); }; var endFunction = function(){ w.hide(); }; var resizeFunction = function(){ var getWinValue = function(property){ return w.get(property) || 0; }; var parentWidth = self.get('actualWidth'); var parentHeight = self.get('actualHeight'); var mediaWidth = self.getMediaWidth(media); var mediaHeight = self.getMediaHeight(media); var popupMaxWidthNumber = parseFloat(popupMaxWidth) / 100; var popupMaxHeightNumber = parseFloat(popupMaxHeight) / 100; var windowWidth = popupMaxWidthNumber * parentWidth; var windowHeight = popupMaxHeightNumber * parentHeight; var footerHeight = getWinValue('footerHeight'); var headerHeight = getWinValue('headerHeight'); if(!headerHeight) { var closeButtonHeight = getWinValue('closeButtonIconHeight') + getWinValue('closeButtonPaddingTop') + getWinValue('closeButtonPaddingBottom'); var titleHeight = self.getPixels(getWinValue('titleFontSize')) + getWinValue('titlePaddingTop') + getWinValue('titlePaddingBottom'); headerHeight = closeButtonHeight > titleHeight ? closeButtonHeight : titleHeight; headerHeight += getWinValue('headerPaddingTop') + getWinValue('headerPaddingBottom'); } var contentWindowWidth = windowWidth - getWinValue('bodyPaddingLeft') - getWinValue('bodyPaddingRight') - getWinValue('paddingLeft') - getWinValue('paddingRight'); var contentWindowHeight = windowHeight - headerHeight - footerHeight - getWinValue('bodyPaddingTop') - getWinValue('bodyPaddingBottom') - getWinValue('paddingTop') - getWinValue('paddingBottom'); var parentAspectRatio = contentWindowWidth / contentWindowHeight; var mediaAspectRatio = mediaWidth / mediaHeight; if(parentAspectRatio > mediaAspectRatio) { windowWidth = contentWindowHeight * mediaAspectRatio + getWinValue('bodyPaddingLeft') + getWinValue('bodyPaddingRight') + getWinValue('paddingLeft') + getWinValue('paddingRight'); } else { windowHeight = contentWindowWidth / mediaAspectRatio + headerHeight + footerHeight + getWinValue('bodyPaddingTop') + getWinValue('bodyPaddingBottom') + getWinValue('paddingTop') + getWinValue('paddingBottom'); } if(windowWidth > parentWidth * popupMaxWidthNumber) { windowWidth = parentWidth * popupMaxWidthNumber; } if(windowHeight > parentHeight * popupMaxHeightNumber) { windowHeight = parentHeight * popupMaxHeightNumber; } w.set('width', windowWidth); w.set('height', windowHeight); w.set('x', (parentWidth - getWinValue('actualWidth')) * 0.5); w.set('y', (parentHeight - getWinValue('actualHeight')) * 0.5); }; if(autoCloseWhenFinished){ this.executeFunctionWhenChange(playList, 0, endFunction); } var mediaClass = media.get('class'); var isVideo = mediaClass == 'Video' || mediaClass == 'Video360'; playList.set('selectedIndex', 0); if(isVideo){ this.bind('resize', resizeFunction, this); resizeFunction(); playList.get('items')[0].get('player').play(); } else { w.set('width', popupMaxWidth); w.set('height', popupMaxHeight); } this.MainViewer.set('toolTipEnabled', false); if(stopAudios) { this.pauseGlobalAudios(); } var playersPaused = this.pauseCurrentPlayers(!stopAudios); w.bind('close', closeFunction, this); w.show(this, true); },
  "cloneCamera": function(camera){  var newCamera = this.rootPlayer.createInstance(camera.get('class')); newCamera.set('id', camera.get('id') + '_copy'); newCamera.set('idleSequence', camera.get('initialSequence')); return newCamera; },
  "getMediaHeight": function(media){  switch(media.get('class')){ case 'Video360': var res = media.get('video'); if(res instanceof Array){ var maxH=0; for(var i=0; i<res.length; i++){ var r = res[i]; if(r.get('height') > maxH) maxH = r.get('height'); } return maxH; }else{ return r.get('height') } default: return media.get('height'); } },
  "openLink": function(url, name){  if(url == location.href) { return; } var isElectron = (window && window.process && window.process.versions && window.process.versions['electron']) || (navigator && navigator.userAgent && navigator.userAgent.indexOf('Electron') >= 0); if (name == '_blank' && isElectron) { if (url.startsWith('/')) { var r = window.location.href.split('/'); r.pop(); url = r.join('/') + url; } var extension = url.split('.').pop().toLowerCase(); if(extension != 'pdf' || url.startsWith('file://')) { var shell = window.require('electron').shell; shell.openExternal(url); } else { window.open(url, name); } } else if(isElectron && (name == '_top' || name == '_self')) { window.location = url; } else { var newWindow = window.open(url, name); newWindow.focus(); } }
 },
 "verticalAlign": "top",
 "height": "100%",
 "minWidth": 20,
 "contentOpaque": false,
 "borderRadius": 0,
 "definitions": [{
 "hfovMin": 60,
 "video": [
  {
   "width": 4000,
   "url": "media/media_7B87C137_70F1_2386_41C8_C4EC15C5443B.mp4",
   "class": "Video360Resource",
   "framerate": 25,
   "bitrate": 20000,
   "type": "video/mp4",
   "posterURL": "media/media_7B87C137_70F1_2386_41C8_C4EC15C5443B_poster.jpg",
   "height": 2000
  },
  {
   "width": 3840,
   "url": "media/media_7B87C137_70F1_2386_41C8_C4EC15C5443B_go.mp4",
   "class": "Video360Resource",
   "framerate": 25,
   "bitrate": 18432,
   "type": "video/mp4",
   "posterURL": "media/media_7B87C137_70F1_2386_41C8_C4EC15C5443B_poster.jpg",
   "height": 1920
  },
  {
   "width": 3168,
   "url": "media/media_7B87C137_70F1_2386_41C8_C4EC15C5443B_ios.mp4",
   "class": "Video360Resource",
   "framerate": 25,
   "bitrate": 12545,
   "type": "video/mp4",
   "posterURL": "media/media_7B87C137_70F1_2386_41C8_C4EC15C5443B_poster.jpg",
   "height": 1584
  }
 ],
 "hfov": 360,
 "label": "Cam 02 - 360",
 "id": "media_7B87C137_70F1_2386_41C8_C4EC15C5443B",
 "thumbnailUrl": "media/media_7B87C137_70F1_2386_41C8_C4EC15C5443B_t.jpg",
 "loop": true,
 "pitch": 0,
 "hfovMax": 140,
 "class": "Video360",
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "yaw": -0.71,
   "backwardYaw": 178.12,
   "panorama": "this.media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550",
   "distance": 1
  },
  {
   "class": "AdjacentPanorama",
   "yaw": -22.56,
   "backwardYaw": -114.06,
   "panorama": "this.media_7ACFAF73_70F2_FF9E_41D4_BA88EFFFD24E",
   "distance": 1
  },
  {
   "class": "AdjacentPanorama",
   "yaw": -170.65,
   "backwardYaw": -5.56,
   "panorama": "this.media_7BBBA45E_70F1_2186_41D3_981E65E575BB",
   "distance": 1
  }
 ],
 "vfov": 180,
 "overlays": [
  "this.overlay_7F92B8D9_70F1_228A_41D4_EE38036F0144",
  "this.overlay_60F6582E_70FF_6186_41C8_954456CF1B91",
  "this.overlay_7F3410CD_70F1_E28A_41D3_719DC3E074E3"
 ],
 "partial": false
},
{
 "class": "RotationalCamera",
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "class": "RotationalCameraPosition",
  "yaw": 98.37,
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_83F38F49_8EB2_7821_41B2_0F3E2115DAFC",
 "automaticZoomSpeed": 10
},
{
 "class": "RotationalCamera",
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "class": "RotationalCameraPosition",
  "yaw": -109.03,
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_829B906B_8EB2_48E1_41D6_B535D763FC53",
 "automaticZoomSpeed": 10
},
{
 "class": "RotationalCamera",
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "class": "RotationalCameraPosition",
  "yaw": -141.29,
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_828F2090_8EB2_483F_41D1_D58C72D71100",
 "automaticZoomSpeed": 10
},
{
 "class": "PlayList",
 "id": "mainPlayList",
 "items": [
  {
   "media": "this.media_604CC0C3_70F1_62FE_41D2_AA2F7D143E19",
   "class": "Video360PlayListItem",
   "start": "this.MainViewerPanoramaPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.mainPlayList, 0, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.mainPlayList, 0)",
   "camera": "this.media_604CC0C3_70F1_62FE_41D2_AA2F7D143E19_camera",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewerPanoramaPlayer)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.media_7AC8AED8_70F3_1E8A_41BC_59A9E5854723",
   "class": "Video360PlayListItem",
   "start": "this.MainViewerPanoramaPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.mainPlayList, 1, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.mainPlayList, 1)",
   "camera": "this.media_7AC8AED8_70F3_1E8A_41BC_59A9E5854723_camera",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewerPanoramaPlayer)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.media_7ACEB6E6_70F3_2E86_41B1_FA6423AFF4D1",
   "class": "Video360PlayListItem",
   "start": "this.MainViewerPanoramaPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.mainPlayList, 2, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.mainPlayList, 2)",
   "camera": "this.media_7ACEB6E6_70F3_2E86_41B1_FA6423AFF4D1_camera",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewerPanoramaPlayer)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.media_7AC91CEA_70F3_228E_41DB_75EE084E992F",
   "class": "Video360PlayListItem",
   "start": "this.MainViewerPanoramaPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.mainPlayList, 3, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.mainPlayList, 3)",
   "camera": "this.media_7AC91CEA_70F3_228E_41DB_75EE084E992F_camera",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewerPanoramaPlayer)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.media_7ACCE620_70F3_21BA_41C4_AABA6C08BC47",
   "class": "Video360PlayListItem",
   "start": "this.MainViewerPanoramaPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.mainPlayList, 4, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.mainPlayList, 4)",
   "camera": "this.media_7ACCE620_70F3_21BA_41C4_AABA6C08BC47_camera",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewerPanoramaPlayer)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.media_7BBBA45E_70F1_2186_41D3_981E65E575BB",
   "class": "Video360PlayListItem",
   "start": "this.MainViewerPanoramaPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.mainPlayList, 5, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.mainPlayList, 5)",
   "camera": "this.media_7BBBA45E_70F1_2186_41D3_981E65E575BB_camera",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewerPanoramaPlayer)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.media_7B87C137_70F1_2386_41C8_C4EC15C5443B",
   "class": "Video360PlayListItem",
   "start": "this.MainViewerPanoramaPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.mainPlayList, 6, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.mainPlayList, 6)",
   "camera": "this.media_7B87C137_70F1_2386_41C8_C4EC15C5443B_camera",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewerPanoramaPlayer)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550",
   "class": "Video360PlayListItem",
   "start": "this.MainViewerPanoramaPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.mainPlayList, 7, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.mainPlayList, 7)",
   "camera": "this.media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550_camera",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewerPanoramaPlayer)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.media_7ACE764D_70F2_E18A_41D3_1FB6974439AE",
   "class": "Video360PlayListItem",
   "start": "this.MainViewerPanoramaPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.mainPlayList, 8, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.mainPlayList, 8)",
   "camera": "this.media_7ACE764D_70F2_E18A_41D3_1FB6974439AE_camera",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewerPanoramaPlayer)",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "media": "this.media_7ACFAF73_70F2_FF9E_41D4_BA88EFFFD24E",
   "class": "Video360PlayListItem",
   "end": "this.trigger('tourEnded')",
   "camera": "this.media_7ACFAF73_70F2_FF9E_41D4_BA88EFFFD24E_camera",
   "begin": "this.fixTogglePlayPauseButton(this.MainViewerPanoramaPlayer)",
   "player": "this.MainViewerPanoramaPlayer",
   "start": "this.MainViewerPanoramaPlayer.set('displayPlaybackBar', true); this.changeBackgroundWhilePlay(this.mainPlayList, 9, '#000000'); this.pauseGlobalAudiosWhilePlayItem(this.mainPlayList, 9)"
  }
 ]
},
{
 "class": "RotationalCamera",
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "class": "RotationalCameraPosition",
  "yaw": 179.29,
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_83DF8F94_8EB2_7827_41D6_3CEE99A4DF17",
 "automaticZoomSpeed": 10
},
{
 "class": "RotationalCamera",
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "class": "RotationalCameraPosition",
  "yaw": 0,
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "media_7BBBA45E_70F1_2186_41D3_981E65E575BB_camera",
 "automaticZoomSpeed": 10
},
{
 "class": "RotationalCamera",
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "class": "RotationalCameraPosition",
  "yaw": -113.19,
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_82E220B4_8EB2_4867_41D4_8C79199B8D6B",
 "automaticZoomSpeed": 10
},
{
 "class": "RotationalCamera",
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "class": "RotationalCameraPosition",
  "yaw": 0,
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "media_7B87C137_70F1_2386_41C8_C4EC15C5443B_camera",
 "automaticZoomSpeed": 10
},
{
 "class": "RotationalCamera",
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "class": "RotationalCameraPosition",
  "yaw": -58.04,
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_8291A058_8EB2_482F_41CA_6CDFDA5CE7B6",
 "automaticZoomSpeed": 10
},
{
 "class": "RotationalCamera",
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "class": "RotationalCameraPosition",
  "yaw": -93.65,
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_83953F0E_8EB2_7822_41CF_89D3DB60099D",
 "automaticZoomSpeed": 10
},
{
 "class": "RotationalCamera",
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "class": "RotationalCameraPosition",
  "yaw": 174.44,
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_83B86ECC_8EB2_7827_41CB_4A944CD5841C",
 "automaticZoomSpeed": 10
},
{
 "class": "RotationalCamera",
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "class": "RotationalCameraPosition",
  "yaw": -176.14,
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_82B8C01F_8EB2_4821_41CF_8D06FCA4E076",
 "automaticZoomSpeed": 10
},
{
 "class": "RotationalCamera",
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "class": "RotationalCameraPosition",
  "yaw": 0,
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "media_7ACEB6E6_70F3_2E86_41B1_FA6423AFF4D1_camera",
 "automaticZoomSpeed": 10
},
{
 "class": "RotationalCamera",
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "class": "RotationalCameraPosition",
  "yaw": -1.88,
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_825CFE91_8EB2_7821_41D3_DE2B3F5419DA",
 "automaticZoomSpeed": 10
},
{
 "class": "RotationalCamera",
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "class": "RotationalCameraPosition",
  "yaw": -117.88,
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_83D06F81_8EB2_7821_41D4_0BB1A4624210",
 "automaticZoomSpeed": 10
},
{
 "class": "RotationalCamera",
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "class": "RotationalCameraPosition",
  "yaw": -98.29,
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_83E11F6D_8EB2_78E1_41DB_F9F516F78991",
 "automaticZoomSpeed": 10
},
{
 "class": "RotationalCamera",
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "class": "RotationalCameraPosition",
  "yaw": 0,
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "media_604CC0C3_70F1_62FE_41D2_AA2F7D143E19_camera",
 "automaticZoomSpeed": 10
},
{
 "class": "RotationalCamera",
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "class": "RotationalCameraPosition",
  "yaw": 0,
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "media_7AC8AED8_70F3_1E8A_41BC_59A9E5854723_camera",
 "automaticZoomSpeed": 10
},
{
 "hfovMin": 60,
 "video": [
  {
   "width": 4000,
   "url": "media/media_7BBBA45E_70F1_2186_41D3_981E65E575BB.mp4",
   "class": "Video360Resource",
   "framerate": 25,
   "bitrate": 20000,
   "type": "video/mp4",
   "posterURL": "media/media_7BBBA45E_70F1_2186_41D3_981E65E575BB_poster.jpg",
   "height": 2000
  },
  {
   "width": 3840,
   "url": "media/media_7BBBA45E_70F1_2186_41D3_981E65E575BB_go.mp4",
   "class": "Video360Resource",
   "framerate": 25,
   "bitrate": 18432,
   "type": "video/mp4",
   "posterURL": "media/media_7BBBA45E_70F1_2186_41D3_981E65E575BB_poster.jpg",
   "height": 1920
  },
  {
   "width": 3168,
   "url": "media/media_7BBBA45E_70F1_2186_41D3_981E65E575BB_ios.mp4",
   "class": "Video360Resource",
   "framerate": 25,
   "bitrate": 12545,
   "type": "video/mp4",
   "posterURL": "media/media_7BBBA45E_70F1_2186_41D3_981E65E575BB_poster.jpg",
   "height": 1584
  }
 ],
 "hfov": 360,
 "label": "Cam 01 -360",
 "id": "media_7BBBA45E_70F1_2186_41D3_981E65E575BB",
 "thumbnailUrl": "media/media_7BBBA45E_70F1_2186_41D3_981E65E575BB_t.jpg",
 "loop": true,
 "pitch": 0,
 "hfovMax": 140,
 "class": "Video360",
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "yaw": -5.56,
   "backwardYaw": -170.65,
   "panorama": "this.media_7B87C137_70F1_2386_41C8_C4EC15C5443B",
   "distance": 1
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 86.35,
   "backwardYaw": -81.63,
   "panorama": "this.media_7AC8AED8_70F3_1E8A_41BC_59A9E5854723",
   "distance": 1
  }
 ],
 "vfov": 180,
 "overlays": [
  "this.overlay_7EA81B79_70F6_E78A_41D7_A7319EE59C8F",
  "this.overlay_7FE8C78E_70F3_2E86_41B4_42680951F947"
 ],
 "partial": false
},
{
 "class": "RotationalCamera",
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "class": "RotationalCameraPosition",
  "yaw": 9.35,
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_83847F2B_8EB2_7861_41C0_93961619CCCB",
 "automaticZoomSpeed": 10
},
{
 "class": "RotationalCamera",
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "class": "RotationalCameraPosition",
  "yaw": -93.07,
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_82BE7033_8EB2_4862_4185_8D6AE5D1873B",
 "automaticZoomSpeed": 10
},
{
 "hfovMin": 60,
 "video": [
  {
   "width": 2500,
   "url": "media/media_604CC0C3_70F1_62FE_41D2_AA2F7D143E19.mp4",
   "class": "Video360Resource",
   "framerate": 25,
   "bitrate": 7812,
   "type": "video/mp4",
   "posterURL": "media/media_604CC0C3_70F1_62FE_41D2_AA2F7D143E19_poster.jpg",
   "height": 1250
  }
 ],
 "hfov": 360,
 "label": "Cam 06 - 360",
 "id": "media_604CC0C3_70F1_62FE_41D2_AA2F7D143E19",
 "thumbnailUrl": "media/media_604CC0C3_70F1_62FE_41D2_AA2F7D143E19_t.jpg",
 "loop": true,
 "pitch": 0,
 "hfovMax": 140,
 "class": "Video360",
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "yaw": 121.96,
   "backwardYaw": 70.97,
   "panorama": "this.media_7ACFAF73_70F2_FF9E_41D4_BA88EFFFD24E",
   "distance": 1
  }
 ],
 "vfov": 180,
 "overlays": [
  "this.overlay_60924D89_7111_228D_41D6_A31A64243438"
 ],
 "partial": false
},
{
 "class": "RotationalCamera",
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "class": "RotationalCameraPosition",
  "yaw": 86.52,
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_82B3300D_8EB2_4826_41E1_0192FBF85013",
 "automaticZoomSpeed": 10
},
{
 "class": "RotationalCamera",
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "class": "RotationalCameraPosition",
  "yaw": 139.99,
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_832AAFCD_8EB2_7821_41C8_012A090F3C45",
 "automaticZoomSpeed": 10
},
{
 "class": "RotationalCamera",
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "class": "RotationalCameraPosition",
  "yaw": 0,
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "media_7ACFAF73_70F2_FF9E_41D4_BA88EFFFD24E_camera",
 "automaticZoomSpeed": 10
},
{
 "class": "RotationalCamera",
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "class": "RotationalCameraPosition",
  "yaw": 0,
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "media_7ACCE620_70F3_21BA_41C4_AABA6C08BC47_camera",
 "automaticZoomSpeed": 10
},
{
 "hfovMin": 60,
 "video": [
  {
   "width": 2500,
   "url": "media/media_7ACCE620_70F3_21BA_41C4_AABA6C08BC47.mp4",
   "class": "Video360Resource",
   "framerate": 25,
   "bitrate": 7812,
   "type": "video/mp4",
   "posterURL": "media/media_7ACCE620_70F3_21BA_41C4_AABA6C08BC47_poster.jpg",
   "height": 1250
  }
 ],
 "hfov": 360,
 "label": "Cam 10 -360",
 "id": "media_7ACCE620_70F3_21BA_41C4_AABA6C08BC47",
 "thumbnailUrl": "media/media_7ACCE620_70F3_21BA_41C4_AABA6C08BC47_t.jpg",
 "loop": true,
 "pitch": 0,
 "hfovMax": 140,
 "class": "Video360",
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "yaw": 81.71,
   "backwardYaw": -51.72,
   "panorama": "this.media_7AC91CEA_70F3_228E_41DB_75EE084E992F",
   "distance": 1
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 11.49,
   "backwardYaw": 38.71,
   "panorama": "this.media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550",
   "distance": 1
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 86.93,
   "backwardYaw": -54.76,
   "panorama": "this.media_7ACE764D_70F2_E18A_41D3_1FB6974439AE",
   "distance": 1
  }
 ],
 "vfov": 180,
 "overlays": [
  "this.overlay_66BFB17A_7116_E38E_419B_CABA6B970DC0",
  "this.overlay_65D215D9_7112_E28A_41A3_68E17D2C77CC",
  "this.overlay_64F3EA8D_7112_E68A_41D1_8441BC67A2F1"
 ],
 "partial": false
},
{
 "hfovMin": 60,
 "video": [
  {
   "width": 2500,
   "url": "media/media_7ACEB6E6_70F3_2E86_41B1_FA6423AFF4D1.mp4",
   "class": "Video360Resource",
   "framerate": 25,
   "bitrate": 7812,
   "type": "video/mp4",
   "posterURL": "media/media_7ACEB6E6_70F3_2E86_41B1_FA6423AFF4D1_poster.jpg",
   "height": 1250
  }
 ],
 "hfov": 360,
 "label": "Cam 08 -360",
 "id": "media_7ACEB6E6_70F3_2E86_41B1_FA6423AFF4D1",
 "thumbnailUrl": "media/media_7ACEB6E6_70F3_2E86_41B1_FA6423AFF4D1_t.jpg",
 "loop": true,
 "pitch": 0,
 "hfovMax": 140,
 "class": "Video360",
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "yaw": -40.01,
   "backwardYaw": 66.81,
   "panorama": "this.media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550",
   "distance": 1
  },
  {
   "class": "AdjacentPanorama",
   "yaw": -131.92,
   "backwardYaw": 18.95,
   "panorama": "this.media_7AC8AED8_70F3_1E8A_41BC_59A9E5854723",
   "distance": 1
  }
 ],
 "vfov": 180,
 "overlays": [
  "this.overlay_65F92C8D_710F_2285_41D8_8758767F7A78",
  "this.overlay_642F27D2_7111_6E9E_41C9_13F31AE0DCF0"
 ],
 "partial": false
},
{
 "class": "RotationalCamera",
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "class": "RotationalCameraPosition",
  "yaw": 48.08,
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_83A7EEEF_8EB2_79E1_41CE_5ADEDE414AB5",
 "automaticZoomSpeed": 10
},
{
 "class": "RotationalCamera",
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "class": "RotationalCameraPosition",
  "yaw": -161.05,
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_82EC10C5_8EB2_4826_41DB_9695AF15474C",
 "automaticZoomSpeed": 10
},
{
 "class": "RotationalCamera",
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "class": "RotationalCameraPosition",
  "yaw": 0,
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "media_7ACE764D_70F2_E18A_41D3_1FB6974439AE_camera",
 "automaticZoomSpeed": 10
},
{
 "class": "RotationalCamera",
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "class": "RotationalCameraPosition",
  "yaw": 65.94,
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_824AFEB0_8EB2_787E_41CC_87EAFEE6C483",
 "automaticZoomSpeed": 10
},
{
 "hfovMin": 60,
 "video": [
  {
   "width": 2500,
   "url": "media/media_7ACE764D_70F2_E18A_41D3_1FB6974439AE.mp4",
   "class": "Video360Resource",
   "framerate": 25,
   "bitrate": 7812,
   "type": "video/mp4",
   "posterURL": "media/media_7ACE764D_70F2_E18A_41D3_1FB6974439AE_poster.jpg",
   "height": 1250
  }
 ],
 "hfov": 360,
 "label": "Cam 04 -360",
 "id": "media_7ACE764D_70F2_E18A_41D3_1FB6974439AE",
 "thumbnailUrl": "media/media_7ACE764D_70F2_E18A_41D3_1FB6974439AE_t.jpg",
 "loop": true,
 "pitch": 0,
 "hfovMax": 140,
 "class": "Video360",
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "yaw": 62.12,
   "backwardYaw": -93.48,
   "panorama": "this.media_7AC91CEA_70F3_228E_41DB_75EE084E992F",
   "distance": 1
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 10.45,
   "backwardYaw": 3.86,
   "panorama": "this.media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550",
   "distance": 1
  },
  {
   "class": "AdjacentPanorama",
   "yaw": -54.76,
   "backwardYaw": 86.93,
   "panorama": "this.media_7ACCE620_70F3_21BA_41C4_AABA6C08BC47",
   "distance": 1
  }
 ],
 "vfov": 180,
 "overlays": [
  "this.overlay_622B21A7_7111_2286_41C1_686CDB5DDFAA",
  "this.overlay_624729CC_713F_E28A_41D6_E74FA0F1578F",
  "this.overlay_65184106_7132_E386_41D4_35D556BEECA9"
 ],
 "partial": false
},
{
 "hfovMin": 60,
 "video": [
  {
   "width": 2500,
   "url": "media/media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550.mp4",
   "class": "Video360Resource",
   "framerate": 25,
   "bitrate": 7812,
   "type": "video/mp4",
   "posterURL": "media/media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550_poster.jpg",
   "height": 1250
  }
 ],
 "hfov": 360,
 "label": "Cam 03 - 360",
 "id": "media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550",
 "thumbnailUrl": "media/media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550_t.jpg",
 "loop": true,
 "pitch": 0,
 "hfovMax": 140,
 "class": "Video360",
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "yaw": 178.12,
   "backwardYaw": -0.71,
   "panorama": "this.media_7B87C137_70F1_2386_41C8_C4EC15C5443B",
   "distance": 1
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 3.86,
   "backwardYaw": 10.45,
   "panorama": "this.media_7ACE764D_70F2_E18A_41D3_1FB6974439AE",
   "distance": 1
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 38.71,
   "backwardYaw": 11.49,
   "panorama": "this.media_7ACCE620_70F3_21BA_41C4_AABA6C08BC47",
   "distance": 1
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 66.81,
   "backwardYaw": -40.01,
   "panorama": "this.media_7ACEB6E6_70F3_2E86_41B1_FA6423AFF4D1",
   "distance": 1
  }
 ],
 "vfov": 180,
 "overlays": [
  "this.overlay_60E6CE10_711F_E19A_41D1_42B8D5FA51AA",
  "this.overlay_63266E0A_7111_218E_41C3_D631B63CBD48",
  "this.overlay_63B44F22_7111_7FBE_41CE_4AFC732E888A",
  "this.overlay_67ED38CC_7173_628A_41D9_18E143CCF311"
 ],
 "partial": false
},
{
 "class": "RotationalCamera",
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "class": "RotationalCameraPosition",
  "yaw": 0,
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550_camera",
 "automaticZoomSpeed": 10
},
{
 "class": "RotationalCamera",
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "class": "RotationalCameraPosition",
  "yaw": -169.55,
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_83CE8FA8_8EB2_786E_41AC_E5B9FF15EF93",
 "automaticZoomSpeed": 10
},
{
 "class": "RotationalCamera",
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "class": "RotationalCameraPosition",
  "yaw": 157.44,
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_82A7E045_8EB2_4826_41E1_30DE1868B37D",
 "automaticZoomSpeed": 10
},
{
 "hfovMin": 60,
 "video": [
  {
   "width": 2500,
   "url": "media/media_7ACFAF73_70F2_FF9E_41D4_BA88EFFFD24E.mp4",
   "class": "Video360Resource",
   "framerate": 25,
   "bitrate": 7812,
   "type": "video/mp4",
   "posterURL": "media/media_7ACFAF73_70F2_FF9E_41D4_BA88EFFFD24E_poster.jpg",
   "height": 1250
  }
 ],
 "hfov": 360,
 "label": "Cam 05 -360",
 "id": "media_7ACFAF73_70F2_FF9E_41D4_BA88EFFFD24E",
 "thumbnailUrl": "media/media_7ACFAF73_70F2_FF9E_41D4_BA88EFFFD24E_t.jpg",
 "loop": true,
 "pitch": 0,
 "hfovMax": 140,
 "class": "Video360",
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "yaw": -114.06,
   "backwardYaw": -22.56,
   "panorama": "this.media_7B87C137_70F1_2386_41C8_C4EC15C5443B",
   "distance": 1
  },
  {
   "class": "AdjacentPanorama",
   "yaw": 70.97,
   "backwardYaw": 121.96,
   "panorama": "this.media_604CC0C3_70F1_62FE_41D2_AA2F7D143E19",
   "distance": 1
  }
 ],
 "vfov": 180,
 "overlays": [
  "this.overlay_6182742C_70F3_218A_41D8_C11BE8141C18",
  "this.overlay_60EA9371_70F7_279A_41D9_3948B2406A33"
 ],
 "partial": false
},
{
 "class": "PanoramaPlayer",
 "touchControlMode": "drag_rotation",
 "gyroscopeVerticalDraggingEnabled": true,
 "mouseControlMode": "drag_rotation",
 "id": "MainViewerPanoramaPlayer",
 "viewerArea": "this.MainViewer",
 "displayPlaybackBar": true,
 "gyroscopeEnabled": true
},
{
 "class": "RotationalCamera",
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "class": "RotationalCameraPosition",
  "yaw": 0,
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "media_7AC91CEA_70F3_228E_41DB_75EE084E992F_camera",
 "automaticZoomSpeed": 10
},
{
 "hfovMin": 60,
 "video": [
  {
   "width": 2500,
   "url": "media/media_7AC8AED8_70F3_1E8A_41BC_59A9E5854723.mp4",
   "class": "Video360Resource",
   "framerate": 25,
   "bitrate": 7812,
   "type": "video/mp4",
   "posterURL": "media/media_7AC8AED8_70F3_1E8A_41BC_59A9E5854723_poster.jpg",
   "height": 1250
  }
 ],
 "hfov": 360,
 "label": "Cam 07 -360",
 "id": "media_7AC8AED8_70F3_1E8A_41BC_59A9E5854723",
 "thumbnailUrl": "media/media_7AC8AED8_70F3_1E8A_41BC_59A9E5854723_t.jpg",
 "loop": true,
 "pitch": 0,
 "hfovMax": 140,
 "class": "Video360",
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "yaw": 18.95,
   "backwardYaw": -131.92,
   "panorama": "this.media_7ACEB6E6_70F3_2E86_41B1_FA6423AFF4D1",
   "distance": 1
  },
  {
   "class": "AdjacentPanorama",
   "yaw": -81.63,
   "backwardYaw": 86.35,
   "panorama": "this.media_7BBBA45E_70F1_2186_41D3_981E65E575BB",
   "distance": 1
  }
 ],
 "vfov": 180,
 "overlays": [
  "this.overlay_6437DA3A_7133_218E_41AD_8D1E622E9945",
  "this.overlay_65489FB4_7131_7E9A_4187_74CCEDD86660"
 ],
 "partial": false
},
{
 "class": "RotationalCamera",
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "class": "RotationalCameraPosition",
  "yaw": -168.51,
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_833BAFBC_8EB2_7866_41D4_0E0BD6CB6A29",
 "automaticZoomSpeed": 10
},
{
 "class": "RotationalCamera",
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "class": "RotationalCameraPosition",
  "yaw": 125.24,
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_82F860A2_8EB2_4863_41D6_C2D4A546241B",
 "automaticZoomSpeed": 10
},
{
 "class": "RotationalCamera",
 "manualZoomSpeed": 1,
 "manualRotationSpeed": 1800,
 "initialPosition": {
  "hfov": 120,
  "class": "RotationalCameraPosition",
  "yaw": 128.28,
  "pitch": 0
 },
 "automaticRotationSpeed": 10,
 "id": "camera_8285507D_8EB2_48E1_41D7_86AE14DA8236",
 "automaticZoomSpeed": 10
},
{
 "hfovMin": 60,
 "video": [
  {
   "width": 4000,
   "url": "media/media_7AC91CEA_70F3_228E_41DB_75EE084E992F.mp4",
   "class": "Video360Resource",
   "framerate": 25,
   "bitrate": 20000,
   "type": "video/mp4",
   "posterURL": "media/media_7AC91CEA_70F3_228E_41DB_75EE084E992F_poster.jpg",
   "height": 2000
  },
  {
   "width": 3840,
   "url": "media/media_7AC91CEA_70F3_228E_41DB_75EE084E992F_go.mp4",
   "class": "Video360Resource",
   "framerate": 25,
   "bitrate": 18432,
   "type": "video/mp4",
   "posterURL": "media/media_7AC91CEA_70F3_228E_41DB_75EE084E992F_poster.jpg",
   "height": 1920
  },
  {
   "width": 3168,
   "url": "media/media_7AC91CEA_70F3_228E_41DB_75EE084E992F_ios.mp4",
   "class": "Video360Resource",
   "framerate": 25,
   "bitrate": 12545,
   "type": "video/mp4",
   "posterURL": "media/media_7AC91CEA_70F3_228E_41DB_75EE084E992F_poster.jpg",
   "height": 1584
  }
 ],
 "hfov": 360,
 "label": "Cam 09 - 360",
 "id": "media_7AC91CEA_70F3_228E_41DB_75EE084E992F",
 "thumbnailUrl": "media/media_7AC91CEA_70F3_228E_41DB_75EE084E992F_t.jpg",
 "loop": true,
 "pitch": 0,
 "hfovMax": 140,
 "class": "Video360",
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "yaw": -51.72,
   "backwardYaw": 81.71,
   "panorama": "this.media_7ACCE620_70F3_21BA_41C4_AABA6C08BC47",
   "distance": 1
  },
  {
   "class": "AdjacentPanorama",
   "yaw": -93.48,
   "backwardYaw": 62.12,
   "panorama": "this.media_7ACE764D_70F2_E18A_41D3_1FB6974439AE",
   "distance": 1
  }
 ],
 "vfov": 180,
 "overlays": [
  "this.overlay_64A25A3C_7113_E18A_41C8_13132652B5E7",
  "this.overlay_67B251F4_7111_229A_41B1_3DF05A122057"
 ],
 "partial": false
},
{
 "toolTipFontSize": "1.11vmin",
 "toolTipOpacity": 1,
 "id": "MainViewer",
 "toolTipShadowBlurRadius": 3,
 "playbackBarHeight": 0,
 "playbackBarBackgroundColorDirection": "vertical",
 "toolTipTextShadowColor": "#000000",
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "playbackBarHeadWidth": 0,
 "playbackBarRight": 0,
 "width": "100%",
 "toolTipTextShadowBlurRadius": 3,
 "toolTipFontWeight": "normal",
 "playbackBarProgressBorderSize": 0,
 "toolTipPaddingBottom": 4,
 "paddingLeft": 0,
 "progressBarBorderRadius": 0,
 "progressBarBorderSize": 0,
 "toolTipShadowColor": "#333333",
 "playbackBarProgressBorderRadius": 0,
 "minHeight": 50,
 "playbackBarBorderRadius": 0,
 "playbackBarHeadBorderRadius": 0,
 "height": "100%",
 "playbackBarProgressBorderColor": "#000000",
 "minWidth": 100,
 "toolTipShadowOpacity": 1,
 "toolTipFontStyle": "normal",
 "progressLeft": 0,
 "playbackBarHeadBorderColor": "#000000",
 "playbackBarHeadBorderSize": 0,
 "playbackBarProgressOpacity": 0,
 "playbackBarBorderSize": 0,
 "propagateClick": false,
 "toolTipTextShadowOpacity": 0,
 "toolTipFontFamily": "Arial",
 "vrPointerSelectionColor": "#FF6600",
 "playbackBarBackgroundOpacity": 0,
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "playbackBarHeadShadowColor": "#000000",
 "toolTipShadowHorizontalLength": 0,
 "vrPointerSelectionTime": 2000,
 "progressRight": 0,
 "shadow": false,
 "progressOpacity": 1,
 "playbackBarHeadShadowVerticalLength": 0,
 "toolTipShadowVerticalLength": 0,
 "progressBarBackgroundColorDirection": "vertical",
 "firstTransitionDuration": 0,
 "progressBottom": 0,
 "progressHeight": 0,
 "playbackBarHeadShadow": true,
 "toolTipBackgroundColor": "#F6F6F6",
 "toolTipFontColor": "#606060",
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "progressBackgroundOpacity": 0,
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarOpacity": 1,
 "vrPointerColor": "#FFFFFF",
 "class": "ViewerArea",
 "borderSize": 0,
 "progressBarOpacity": 0,
 "playbackBarBorderColor": "#FFFFFF",
 "progressBorderSize": 0,
 "playbackBarHeadShadowOpacity": 0,
 "transitionMode": "blending",
 "toolTipBorderSize": 1,
 "displayTooltipInTouchScreens": true,
 "transitionDuration": 500,
 "toolTipPaddingTop": 4,
 "toolTipPaddingLeft": 6,
 "progressBorderRadius": 0,
 "toolTipPaddingRight": 6,
 "toolTipDisplayTime": 600,
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "playbackBarLeft": 0,
 "progressBackgroundColorRatios": [
  0
 ],
 "playbackBarHeadShadowHorizontalLength": 0,
 "toolTipBorderRadius": 3,
 "borderRadius": 0,
 "playbackBarHeadShadowBlurRadius": 0,
 "playbackBarHeadHeight": 0,
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "progressBarBorderColor": "#000000",
 "paddingTop": 0,
 "progressBarBackgroundColorRatios": [
  0
 ],
 "progressBackgroundColorDirection": "vertical",
 "playbackBarHeadOpacity": 0,
 "playbackBarBottom": 5,
 "paddingRight": 0,
 "paddingBottom": 0,
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "toolTipShadowSpread": 0,
 "progressBorderColor": "#000000",
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "toolTipBorderColor": "#767676",
 "data": {
  "name": "Main Viewer"
 },
 "playbackBarProgressBackgroundColorDirection": "vertical"
},
{
 "class": "HotspotPanoramaOverlay",
 "id": "overlay_7F92B8D9_70F1_228A_41D4_EE38036F0144",
 "data": {
  "label": "Cam- 03 -360"
 },
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550, this.camera_825CFE91_8EB2_7821_41D3_DE2B3F5419DA); this.mainPlayList.set('selectedIndex', 7); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_63A473CF_7117_6686_41CE_018307259E4C",
   "pitch": 0,
   "class": "HotspotPanoramaOverlayImage",
   "yaw": 0,
   "distance": 100,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": 9.89,
     "hfov": 13.3,
     "yaw": -0.71
    }
   ]
  }
 ],
 "rollOverDisplay": false,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_7B87C137_70F1_2386_41C8_C4EC15C5443B_HS_0_0_0_map.gif",
      "width": 27,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": 9.89,
     "hfov": 13.3,
     "yaw": -0.71
    }
   ]
  }
 ],
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "id": "overlay_60F6582E_70FF_6186_41C8_954456CF1B91",
 "data": {
  "label": "Cam- 05 -360"
 },
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7ACFAF73_70F2_FF9E_41D4_BA88EFFFD24E, this.camera_824AFEB0_8EB2_787E_41CC_87EAFEE6C483); this.mainPlayList.set('selectedIndex', 9); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_63A423CF_7117_6686_41CE_998D8BA13AE5",
   "pitch": 0,
   "class": "HotspotPanoramaOverlayImage",
   "yaw": 0,
   "distance": 100,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": -8.14,
     "hfov": 13.36,
     "yaw": -22.56
    }
   ]
  }
 ],
 "rollOverDisplay": false,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_7B87C137_70F1_2386_41C8_C4EC15C5443B_HS_1_0_0_map.gif",
      "width": 27,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": -8.14,
     "hfov": 13.36,
     "yaw": -22.56
    }
   ]
  }
 ],
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "id": "overlay_7F3410CD_70F1_E28A_41D3_719DC3E074E3",
 "data": {
  "label": "Cam- 01 -360"
 },
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7BBBA45E_70F1_2186_41D3_981E65E575BB, this.camera_83B86ECC_8EB2_7827_41CB_4A944CD5841C); this.mainPlayList.set('selectedIndex', 5); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_63A583D0_7117_669A_41C6_87F3BD091D71",
   "pitch": 0,
   "class": "HotspotPanoramaOverlayImage",
   "yaw": 0,
   "distance": 100,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": -11.44,
     "hfov": 13.23,
     "yaw": -170.65
    }
   ]
  }
 ],
 "rollOverDisplay": false,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_7B87C137_70F1_2386_41C8_C4EC15C5443B_HS_2_0_0_map.gif",
      "width": 27,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": -11.44,
     "hfov": 13.23,
     "yaw": -170.65
    }
   ]
  }
 ],
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "id": "overlay_7EA81B79_70F6_E78A_41D7_A7319EE59C8F",
 "data": {
  "label": "Cam- 02 -360"
 },
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7B87C137_70F1_2386_41C8_C4EC15C5443B, this.camera_83847F2B_8EB2_7861_41C0_93961619CCCB); this.mainPlayList.set('selectedIndex', 6); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_639B93CC_7117_668A_41D5_7077402E040E",
   "pitch": 0,
   "class": "HotspotPanoramaOverlayImage",
   "yaw": 0,
   "distance": 100,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": -12.13,
     "hfov": 13.2,
     "yaw": -5.56
    }
   ]
  }
 ],
 "rollOverDisplay": false,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_7BBBA45E_70F1_2186_41D3_981E65E575BB_HS_0_0_0_map.gif",
      "width": 27,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": -12.13,
     "hfov": 13.2,
     "yaw": -5.56
    }
   ]
  }
 ],
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "id": "overlay_7FE8C78E_70F3_2E86_41B4_42680951F947",
 "data": {
  "label": "Cam- 07 -360"
 },
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7AC8AED8_70F3_1E8A_41BC_59A9E5854723, this.camera_83F38F49_8EB2_7821_41B2_0F3E2115DAFC); this.mainPlayList.set('selectedIndex', 1); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_63A493CF_7117_6686_41BE_E32E3760AC38",
   "pitch": 0,
   "class": "HotspotPanoramaOverlayImage",
   "yaw": 0,
   "distance": 100,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": -5.54,
     "hfov": 13.44,
     "yaw": 86.35
    }
   ]
  }
 ],
 "rollOverDisplay": false,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_7BBBA45E_70F1_2186_41D3_981E65E575BB_HS_1_0_0_map.gif",
      "width": 27,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": -5.54,
     "hfov": 13.44,
     "yaw": 86.35
    }
   ]
  }
 ],
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "id": "overlay_60924D89_7111_228D_41D6_A31A64243438",
 "data": {
  "label": "Cam- 05 -360"
 },
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7ACFAF73_70F2_FF9E_41D4_BA88EFFFD24E, this.camera_829B906B_8EB2_48E1_41D6_B535D763FC53); this.mainPlayList.set('selectedIndex', 9); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_63A6E3D0_7117_669A_41C9_A3E288CBBF09",
   "pitch": 0,
   "class": "HotspotPanoramaOverlayImage",
   "yaw": 0,
   "distance": 100,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": -4.73,
     "hfov": 21.53,
     "yaw": 121.96
    }
   ]
  }
 ],
 "rollOverDisplay": false,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_604CC0C3_70F1_62FE_41D2_AA2F7D143E19_HS_0_0_0_map.gif",
      "width": 16,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": -4.73,
     "hfov": 21.53,
     "yaw": 121.96
    }
   ]
  }
 ],
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "id": "overlay_66BFB17A_7116_E38E_419B_CABA6B970DC0",
 "data": {
  "label": "Cam- 04 -360"
 },
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7ACE764D_70F2_E18A_41D3_1FB6974439AE, this.camera_82F860A2_8EB2_4863_41D6_C2D4A546241B); this.mainPlayList.set('selectedIndex', 8); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_6934CBC2_7171_26FE_41D4_8CBC060A5BB8",
   "pitch": 0,
   "class": "HotspotPanoramaOverlayImage",
   "yaw": 0,
   "distance": 50,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": -39.11,
     "hfov": 16.76,
     "yaw": 86.93
    }
   ]
  }
 ],
 "rollOverDisplay": false,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_7ACCE620_70F3_21BA_41C4_AABA6C08BC47_HS_0_0_0_map.gif",
      "width": 34,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": -39.11,
     "hfov": 16.76,
     "yaw": 86.93
    }
   ]
  }
 ],
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "id": "overlay_65D215D9_7112_E28A_41A3_68E17D2C77CC",
 "data": {
  "label": "Cam- 09 -360"
 },
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7AC91CEA_70F3_228E_41DB_75EE084E992F, this.camera_8285507D_8EB2_48E1_41D7_86AE14DA8236); this.mainPlayList.set('selectedIndex', 3); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": -6.97,
     "hfov": 11.43,
     "yaw": 81.71
    }
   ],
   "distance": 50,
   "image": {
    "levels": [
     {
      "url": "media/media_7ACCE620_70F3_21BA_41C4_AABA6C08BC47_HS_1_0.png",
      "width": 512,
      "class": "ImageResourceLevel",
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "yaw": 0
  }
 ],
 "rollOverDisplay": false,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_7ACCE620_70F3_21BA_41C4_AABA6C08BC47_HS_1_0_0_map.gif",
      "width": 16,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": -6.97,
     "hfov": 11.43,
     "yaw": 81.71
    }
   ]
  }
 ],
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "id": "overlay_64F3EA8D_7112_E68A_41D1_8441BC67A2F1",
 "data": {
  "label": "Cam- 03 -360"
 },
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550, this.camera_828F2090_8EB2_483F_41D1_D58C72D71100); this.mainPlayList.set('selectedIndex', 7); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_69372BC4_7171_26FA_41C0_64172053F251",
   "pitch": 0,
   "class": "HotspotPanoramaOverlayImage",
   "yaw": 0,
   "distance": 50,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": -27.32,
     "hfov": 19.19,
     "yaw": 11.49
    }
   ]
  }
 ],
 "rollOverDisplay": false,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_7ACCE620_70F3_21BA_41C4_AABA6C08BC47_HS_2_0_0_map.gif",
      "width": 29,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": -27.32,
     "hfov": 19.19,
     "yaw": 11.49
    }
   ]
  }
 ],
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "id": "overlay_65F92C8D_710F_2285_41D8_8758767F7A78",
 "data": {
  "label": "Cam- 07 -360"
 },
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7AC8AED8_70F3_1E8A_41BC_59A9E5854723, this.camera_82EC10C5_8EB2_4826_41DB_9695AF15474C); this.mainPlayList.set('selectedIndex', 1); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_6935EBC2_7171_26FE_41D4_0F5AE302026C",
   "pitch": 0,
   "class": "HotspotPanoramaOverlayImage",
   "yaw": 0,
   "distance": 100,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": -11.36,
     "hfov": 21.18,
     "yaw": -131.92
    }
   ]
  }
 ],
 "rollOverDisplay": false,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_7ACEB6E6_70F3_2E86_41B1_FA6423AFF4D1_HS_0_0_0_map.gif",
      "width": 27,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": -11.36,
     "hfov": 21.18,
     "yaw": -131.92
    }
   ]
  }
 ],
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "id": "overlay_642F27D2_7111_6E9E_41C9_13F31AE0DCF0",
 "data": {
  "label": "Cam- 03 -360"
 },
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550, this.camera_82E220B4_8EB2_4867_41D4_8C79199B8D6B); this.mainPlayList.set('selectedIndex', 7); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_6935ABC2_7171_26FE_41AA_B4D9D45C5AD3",
   "pitch": 0,
   "class": "HotspotPanoramaOverlayImage",
   "yaw": 0,
   "distance": 100,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": -5.29,
     "hfov": 21.51,
     "yaw": -40.01
    }
   ]
  }
 ],
 "rollOverDisplay": false,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_7ACEB6E6_70F3_2E86_41B1_FA6423AFF4D1_HS_1_0_0_map.gif",
      "width": 27,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": -5.29,
     "hfov": 21.51,
     "yaw": -40.01
    }
   ]
  }
 ],
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "id": "overlay_622B21A7_7111_2286_41C1_686CDB5DDFAA",
 "data": {
  "label": "Cam- 03 -360"
 },
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550, this.camera_82B8C01F_8EB2_4821_41CF_8D06FCA4E076); this.mainPlayList.set('selectedIndex', 7); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_67D73F36_7131_1F86_41BB_FD9D4AE78D57",
   "pitch": 0,
   "class": "HotspotPanoramaOverlayImage",
   "yaw": 0,
   "distance": 100,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": -9.63,
     "hfov": 21.3,
     "yaw": 10.45
    }
   ]
  }
 ],
 "rollOverDisplay": false,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_7ACE764D_70F2_E18A_41D3_1FB6974439AE_HS_0_0_0_map.gif",
      "width": 27,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": -9.63,
     "hfov": 21.3,
     "yaw": 10.45
    }
   ]
  }
 ],
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "id": "overlay_624729CC_713F_E28A_41D6_E74FA0F1578F",
 "data": {
  "label": "Cam- 09 -360"
 },
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7AC91CEA_70F3_228E_41DB_75EE084E992F, this.camera_82B3300D_8EB2_4826_41E1_0192FBF85013); this.mainPlayList.set('selectedIndex', 3); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": 32.39,
     "hfov": 9.73,
     "yaw": 62.12
    }
   ],
   "distance": 50,
   "image": {
    "levels": [
     {
      "url": "media/media_7ACE764D_70F2_E18A_41D3_1FB6974439AE_HS_2_0.png",
      "width": 512,
      "class": "ImageResourceLevel",
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "yaw": 0
  }
 ],
 "rollOverDisplay": false,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_7ACE764D_70F2_E18A_41D3_1FB6974439AE_HS_2_0_0_map.gif",
      "width": 16,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": 32.39,
     "hfov": 9.73,
     "yaw": 62.12
    }
   ]
  }
 ],
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "id": "overlay_65184106_7132_E386_41D4_35D556BEECA9",
 "data": {
  "label": "Cam- 10 -360"
 },
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7ACCE620_70F3_21BA_41C4_AABA6C08BC47, this.camera_82BE7033_8EB2_4862_4185_8D6AE5D1873B); this.mainPlayList.set('selectedIndex', 4); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": 30.31,
     "hfov": 9.95,
     "yaw": -54.76
    }
   ],
   "distance": 50,
   "image": {
    "levels": [
     {
      "url": "media/media_7ACE764D_70F2_E18A_41D3_1FB6974439AE_HS_3_0.png",
      "width": 512,
      "class": "ImageResourceLevel",
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "yaw": 0
  }
 ],
 "rollOverDisplay": false,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_7ACE764D_70F2_E18A_41D3_1FB6974439AE_HS_3_0_0_map.gif",
      "width": 16,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": 30.31,
     "hfov": 9.95,
     "yaw": -54.76
    }
   ]
  }
 ],
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "id": "overlay_60E6CE10_711F_E19A_41D1_42B8D5FA51AA",
 "data": {
  "label": "Cam- 02 -360"
 },
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7B87C137_70F1_2386_41C8_C4EC15C5443B, this.camera_83DF8F94_8EB2_7827_41D6_3CEE99A4DF17); this.mainPlayList.set('selectedIndex', 6); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_65A90C1A_7111_218F_41A3_7F5D63DAB730",
   "pitch": 0,
   "class": "HotspotPanoramaOverlayImage",
   "yaw": 0,
   "distance": 100,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": -16.04,
     "hfov": 20.76,
     "yaw": 178.12
    }
   ]
  }
 ],
 "rollOverDisplay": false,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550_HS_0_0_0_map.gif",
      "width": 27,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": -16.04,
     "hfov": 20.76,
     "yaw": 178.12
    }
   ]
  }
 ],
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "id": "overlay_63266E0A_7111_218E_41C3_D631B63CBD48",
 "data": {
  "label": "Cam- 04 -360"
 },
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7ACE764D_70F2_E18A_41D3_1FB6974439AE, this.camera_83CE8FA8_8EB2_786E_41AC_E5B9FF15EF93); this.mainPlayList.set('selectedIndex', 8); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_67D05F35_7131_1F9A_41B9_C649C62E16A7",
   "pitch": 0,
   "class": "HotspotPanoramaOverlayImage",
   "yaw": 0,
   "distance": 100,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": -7.37,
     "hfov": 21.42,
     "yaw": 3.86
    }
   ]
  }
 ],
 "rollOverDisplay": false,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550_HS_1_0_0_map.gif",
      "width": 32,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": -7.37,
     "hfov": 21.42,
     "yaw": 3.86
    }
   ]
  }
 ],
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "id": "overlay_63B44F22_7111_7FBE_41CE_4AFC732E888A",
 "data": {
  "label": "Cam- 08 -360"
 },
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7ACEB6E6_70F3_2E86_41B1_FA6423AFF4D1, this.camera_832AAFCD_8EB2_7821_41C8_012A090F3C45); this.mainPlayList.set('selectedIndex', 2); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_67D7FF35_7131_1F9A_419D_E25314D82F32",
   "pitch": 0,
   "class": "HotspotPanoramaOverlayImage",
   "yaw": 0,
   "distance": 100,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": -8.93,
     "hfov": 21.34,
     "yaw": 66.81
    }
   ]
  }
 ],
 "rollOverDisplay": false,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550_HS_2_0_0_map.gif",
      "width": 27,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": -8.93,
     "hfov": 21.34,
     "yaw": 66.81
    }
   ]
  }
 ],
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "id": "overlay_67ED38CC_7173_628A_41D9_18E143CCF311",
 "data": {
  "label": "Cam- 10 -360"
 },
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7ACCE620_70F3_21BA_41C4_AABA6C08BC47, this.camera_833BAFBC_8EB2_7866_41D4_0E0BD6CB6A29); this.mainPlayList.set('selectedIndex', 4); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": 23.55,
     "hfov": 10.56,
     "yaw": 38.71
    }
   ],
   "distance": 50,
   "image": {
    "levels": [
     {
      "url": "media/media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550_HS_4_0.png",
      "width": 512,
      "class": "ImageResourceLevel",
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "yaw": 0
  }
 ],
 "rollOverDisplay": false,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550_HS_4_0_0_map.gif",
      "width": 16,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": 23.55,
     "hfov": 10.56,
     "yaw": 38.71
    }
   ]
  }
 ],
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "id": "overlay_6182742C_70F3_218A_41D8_C11BE8141C18",
 "data": {
  "label": "Cam- 02 -360"
 },
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7B87C137_70F1_2386_41C8_C4EC15C5443B, this.camera_82A7E045_8EB2_4826_41E1_30DE1868B37D); this.mainPlayList.set('selectedIndex', 6); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_63A553D0_7117_669A_41CB_645958D8C575",
   "pitch": 0,
   "class": "HotspotPanoramaOverlayImage",
   "yaw": 0,
   "distance": 100,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": -9.28,
     "hfov": 21.32,
     "yaw": -114.06
    }
   ]
  }
 ],
 "rollOverDisplay": false,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_7ACFAF73_70F2_FF9E_41D4_BA88EFFFD24E_HS_0_0_0_map.gif",
      "width": 27,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": -9.28,
     "hfov": 21.32,
     "yaw": -114.06
    }
   ]
  }
 ],
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "id": "overlay_60EA9371_70F7_279A_41D9_3948B2406A33",
 "data": {
  "label": "Cam- 06 -360"
 },
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_604CC0C3_70F1_62FE_41D2_AA2F7D143E19, this.camera_8291A058_8EB2_482F_41CA_6CDFDA5CE7B6); this.mainPlayList.set('selectedIndex', 0); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_63A503D0_7117_669A_41CF_5123D16A639D",
   "pitch": 0,
   "class": "HotspotPanoramaOverlayImage",
   "yaw": 0,
   "distance": 100,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": -2.3,
     "hfov": 21.58,
     "yaw": 70.97
    }
   ]
  }
 ],
 "rollOverDisplay": false,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_7ACFAF73_70F2_FF9E_41D4_BA88EFFFD24E_HS_1_0_0_map.gif",
      "width": 16,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": -2.3,
     "hfov": 21.58,
     "yaw": 70.97
    }
   ]
  }
 ],
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "id": "overlay_6437DA3A_7133_218E_41AD_8D1E622E9945",
 "data": {
  "label": "Cam- 01 -360"
 },
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7BBBA45E_70F1_2186_41D3_981E65E575BB, this.camera_83953F0E_8EB2_7822_41CF_89D3DB60099D); this.mainPlayList.set('selectedIndex', 5); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_6932BBB2_7171_269E_41DC_05F776F2D3F3",
   "pitch": 0,
   "class": "HotspotPanoramaOverlayImage",
   "yaw": 0,
   "distance": 100,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": -6.33,
     "hfov": 21.47,
     "yaw": -81.63
    }
   ]
  }
 ],
 "rollOverDisplay": false,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_7AC8AED8_70F3_1E8A_41BC_59A9E5854723_HS_0_0_0_map.gif",
      "width": 27,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": -6.33,
     "hfov": 21.47,
     "yaw": -81.63
    }
   ]
  }
 ],
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "id": "overlay_65489FB4_7131_7E9A_4187_74CCEDD86660",
 "data": {
  "label": "Cam- 08 -360"
 },
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7ACEB6E6_70F3_2E86_41B1_FA6423AFF4D1, this.camera_83A7EEEF_8EB2_79E1_41CE_5ADEDE414AB5); this.mainPlayList.set('selectedIndex', 2); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_69357BB2_7171_269E_41B3_0F1B62FF0D6F",
   "pitch": 0,
   "class": "HotspotPanoramaOverlayImage",
   "yaw": 0,
   "distance": 100,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": -2.86,
     "hfov": 21.57,
     "yaw": 18.95
    }
   ]
  }
 ],
 "rollOverDisplay": false,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_7AC8AED8_70F3_1E8A_41BC_59A9E5854723_HS_1_0_0_map.gif",
      "width": 27,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": -2.86,
     "hfov": 21.57,
     "yaw": 18.95
    }
   ]
  }
 ],
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "id": "overlay_64A25A3C_7113_E18A_41C8_13132652B5E7",
 "data": {
  "label": "Cam- 04 -360"
 },
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7ACE764D_70F2_E18A_41D3_1FB6974439AE, this.camera_83D06F81_8EB2_7821_41D4_0BB1A4624210); this.mainPlayList.set('selectedIndex', 8); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "image": "this.AnimatedImageResource_69344BC2_7171_26FE_41CB_7418E3BF45F9",
   "pitch": 0,
   "class": "HotspotPanoramaOverlayImage",
   "yaw": 0,
   "distance": 100,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": -30.68,
     "hfov": 11.61,
     "yaw": -93.48
    }
   ]
  }
 ],
 "rollOverDisplay": false,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_7AC91CEA_70F3_228E_41DB_75EE084E992F_HS_0_0_0_map.gif",
      "width": 32,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": -30.68,
     "hfov": 11.61,
     "yaw": -93.48
    }
   ]
  }
 ],
 "enabledInCardboard": true
},
{
 "class": "HotspotPanoramaOverlay",
 "id": "overlay_67B251F4_7111_229A_41B1_3DF05A122057",
 "data": {
  "label": "Cam- 10 -360"
 },
 "areas": [
  {
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.media_7ACCE620_70F3_21BA_41C4_AABA6C08BC47, this.camera_83E11F6D_8EB2_78E1_41DB_F9F516F78991); this.mainPlayList.set('selectedIndex', 4); this.MainViewerPanoramaPlayer.play()",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": 6.28,
     "hfov": 7.16,
     "yaw": -51.72
    }
   ],
   "distance": 50,
   "image": {
    "levels": [
     {
      "url": "media/media_7AC91CEA_70F3_228E_41DB_75EE084E992F_HS_1_0.png",
      "width": 512,
      "class": "ImageResourceLevel",
      "height": 512
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "yaw": 0
  }
 ],
 "rollOverDisplay": false,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 0,
   "image": {
    "levels": [
     {
      "url": "media/media_7AC91CEA_70F3_228E_41DB_75EE084E992F_HS_1_0_0_map.gif",
      "width": 16,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0,
   "playbackPositions": [
    {
     "opacity": 1,
     "roll": 0,
     "class": "PanoramaOverlayPlaybackPosition",
     "timestamp": 0,
     "pitch": 6.28,
     "hfov": 7.16,
     "yaw": -51.72
    }
   ]
  }
 ],
 "enabledInCardboard": true
},
{
 "rowCount": 6,
 "colCount": 4,
 "frameDuration": 41,
 "class": "AnimatedImageResource",
 "id": "AnimatedImageResource_63A473CF_7117_6686_41CE_018307259E4C",
 "levels": [
  {
   "url": "media/media_7B87C137_70F1_2386_41C8_C4EC15C5443B_HS_0_0.png",
   "width": 480,
   "class": "ImageResourceLevel",
   "height": 420
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "colCount": 4,
 "frameDuration": 41,
 "class": "AnimatedImageResource",
 "id": "AnimatedImageResource_63A423CF_7117_6686_41CE_998D8BA13AE5",
 "levels": [
  {
   "url": "media/media_7B87C137_70F1_2386_41C8_C4EC15C5443B_HS_1_0.png",
   "width": 480,
   "class": "ImageResourceLevel",
   "height": 420
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "colCount": 4,
 "frameDuration": 41,
 "class": "AnimatedImageResource",
 "id": "AnimatedImageResource_63A583D0_7117_669A_41C6_87F3BD091D71",
 "levels": [
  {
   "url": "media/media_7B87C137_70F1_2386_41C8_C4EC15C5443B_HS_2_0.png",
   "width": 480,
   "class": "ImageResourceLevel",
   "height": 420
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "colCount": 4,
 "frameDuration": 41,
 "class": "AnimatedImageResource",
 "id": "AnimatedImageResource_639B93CC_7117_668A_41D5_7077402E040E",
 "levels": [
  {
   "url": "media/media_7BBBA45E_70F1_2186_41D3_981E65E575BB_HS_0_0.png",
   "width": 480,
   "class": "ImageResourceLevel",
   "height": 420
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "colCount": 4,
 "frameDuration": 41,
 "class": "AnimatedImageResource",
 "id": "AnimatedImageResource_63A493CF_7117_6686_41BE_E32E3760AC38",
 "levels": [
  {
   "url": "media/media_7BBBA45E_70F1_2186_41D3_981E65E575BB_HS_1_0.png",
   "width": 480,
   "class": "ImageResourceLevel",
   "height": 420
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "colCount": 4,
 "frameDuration": 41,
 "class": "AnimatedImageResource",
 "id": "AnimatedImageResource_63A6E3D0_7117_669A_41C9_A3E288CBBF09",
 "levels": [
  {
   "url": "media/media_604CC0C3_70F1_62FE_41D2_AA2F7D143E19_HS_0_0.png",
   "width": 800,
   "class": "ImageResourceLevel",
   "height": 1200
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "colCount": 4,
 "frameDuration": 41,
 "class": "AnimatedImageResource",
 "id": "AnimatedImageResource_6934CBC2_7171_26FE_41D4_8CBC060A5BB8",
 "levels": [
  {
   "url": "media/media_7ACCE620_70F3_21BA_41C4_AABA6C08BC47_HS_0_0.png",
   "width": 520,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "colCount": 4,
 "frameDuration": 41,
 "class": "AnimatedImageResource",
 "id": "AnimatedImageResource_69372BC4_7171_26FA_41C0_64172053F251",
 "levels": [
  {
   "url": "media/media_7ACCE620_70F3_21BA_41C4_AABA6C08BC47_HS_2_0.png",
   "width": 520,
   "class": "ImageResourceLevel",
   "height": 420
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "colCount": 4,
 "frameDuration": 41,
 "class": "AnimatedImageResource",
 "id": "AnimatedImageResource_6935EBC2_7171_26FE_41D4_0F5AE302026C",
 "levels": [
  {
   "url": "media/media_7ACEB6E6_70F3_2E86_41B1_FA6423AFF4D1_HS_0_0.png",
   "width": 480,
   "class": "ImageResourceLevel",
   "height": 420
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "colCount": 4,
 "frameDuration": 41,
 "class": "AnimatedImageResource",
 "id": "AnimatedImageResource_6935ABC2_7171_26FE_41AA_B4D9D45C5AD3",
 "levels": [
  {
   "url": "media/media_7ACEB6E6_70F3_2E86_41B1_FA6423AFF4D1_HS_1_0.png",
   "width": 480,
   "class": "ImageResourceLevel",
   "height": 420
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "colCount": 4,
 "frameDuration": 41,
 "class": "AnimatedImageResource",
 "id": "AnimatedImageResource_67D73F36_7131_1F86_41BB_FD9D4AE78D57",
 "levels": [
  {
   "url": "media/media_7ACE764D_70F2_E18A_41D3_1FB6974439AE_HS_0_0.png",
   "width": 480,
   "class": "ImageResourceLevel",
   "height": 420
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "colCount": 4,
 "frameDuration": 41,
 "class": "AnimatedImageResource",
 "id": "AnimatedImageResource_65A90C1A_7111_218F_41A3_7F5D63DAB730",
 "levels": [
  {
   "url": "media/media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550_HS_0_0.png",
   "width": 480,
   "class": "ImageResourceLevel",
   "height": 420
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "colCount": 4,
 "frameDuration": 41,
 "class": "AnimatedImageResource",
 "id": "AnimatedImageResource_67D05F35_7131_1F9A_41B9_C649C62E16A7",
 "levels": [
  {
   "url": "media/media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550_HS_1_0.png",
   "width": 480,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "colCount": 4,
 "frameDuration": 41,
 "class": "AnimatedImageResource",
 "id": "AnimatedImageResource_67D7FF35_7131_1F9A_419D_E25314D82F32",
 "levels": [
  {
   "url": "media/media_7AB8CDDF_70F1_2286_41D0_58D4CB6C7550_HS_2_0.png",
   "width": 480,
   "class": "ImageResourceLevel",
   "height": 420
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "colCount": 4,
 "frameDuration": 41,
 "class": "AnimatedImageResource",
 "id": "AnimatedImageResource_63A553D0_7117_669A_41CB_645958D8C575",
 "levels": [
  {
   "url": "media/media_7ACFAF73_70F2_FF9E_41D4_BA88EFFFD24E_HS_0_0.png",
   "width": 480,
   "class": "ImageResourceLevel",
   "height": 420
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "colCount": 4,
 "frameDuration": 41,
 "class": "AnimatedImageResource",
 "id": "AnimatedImageResource_63A503D0_7117_669A_41CF_5123D16A639D",
 "levels": [
  {
   "url": "media/media_7ACFAF73_70F2_FF9E_41D4_BA88EFFFD24E_HS_1_0.png",
   "width": 800,
   "class": "ImageResourceLevel",
   "height": 1200
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "colCount": 4,
 "frameDuration": 41,
 "class": "AnimatedImageResource",
 "id": "AnimatedImageResource_6932BBB2_7171_269E_41DC_05F776F2D3F3",
 "levels": [
  {
   "url": "media/media_7AC8AED8_70F3_1E8A_41BC_59A9E5854723_HS_0_0.png",
   "width": 480,
   "class": "ImageResourceLevel",
   "height": 420
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "colCount": 4,
 "frameDuration": 41,
 "class": "AnimatedImageResource",
 "id": "AnimatedImageResource_69357BB2_7171_269E_41B3_0F1B62FF0D6F",
 "levels": [
  {
   "url": "media/media_7AC8AED8_70F3_1E8A_41BC_59A9E5854723_HS_1_0.png",
   "width": 480,
   "class": "ImageResourceLevel",
   "height": 420
  }
 ],
 "frameCount": 24
},
{
 "rowCount": 6,
 "colCount": 4,
 "frameDuration": 41,
 "class": "AnimatedImageResource",
 "id": "AnimatedImageResource_69344BC2_7171_26FE_41CB_7418E3BF45F9",
 "levels": [
  {
   "url": "media/media_7AC91CEA_70F3_228E_41DB_75EE084E992F_HS_0_0.png",
   "width": 480,
   "class": "ImageResourceLevel",
   "height": 360
  }
 ],
 "frameCount": 24
}],
 "scrollBarColor": "#000000",
 "paddingTop": 0,
 "propagateClick": false,
 "paddingRight": 0,
 "mouseWheelEnabled": true,
 "backgroundPreloadEnabled": true,
 "paddingBottom": 0,
 "desktopMipmappingEnabled": false,
 "data": {
  "name": "Player485"
 },
 "gap": 10,
 "scrollBarOpacity": 0.5,
 "mobileMipmappingEnabled": false,
 "shadow": false,
 "scrollBarVisible": "rollOver",
 "overflow": "visible",
 "vrPolyfillScale": 0.5
};

    
    function HistoryData(playList) {
        this.playList = playList;
        this.list = [];
        this.pointer = -1;
    }

    HistoryData.prototype.add = function(index){
        if(this.pointer < this.list.length && this.list[this.pointer] == index) {
            return;
        }
        ++this.pointer;
        this.list.splice(this.pointer, this.list.length - this.pointer, index);
    };

    HistoryData.prototype.back = function(){
        if(!this.canBack()) return;
        this.playList.set('selectedIndex', this.list[--this.pointer]);
    };

    HistoryData.prototype.forward = function(){
        if(!this.canForward()) return;
        this.playList.set('selectedIndex', this.list[++this.pointer]);
    };

    HistoryData.prototype.canBack = function(){
        return this.pointer > 0;
    };

    HistoryData.prototype.canForward = function(){
        return this.pointer >= 0 && this.pointer < this.list.length-1;
    };
    //

    if(script.data == undefined)
        script.data = {};
    script.data["history"] = {};    //playListID -> HistoryData

    TDV.PlayerAPI.defineScript(script);
})();
