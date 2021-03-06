// TODO: refactor
Ctrl.$launcher = (function() {

    var _launcherIcon = "",
        _clickToOpenConversation = "";

    function PPLauncherCtrl() {

        var self = this,

            _showHoverCard = function() {
                Ctrl.$hoverCard.get().showHoverCard();
            },

            _hideHoverCard = function() {
                Ctrl.$hoverCard.get().hideHoverCard();
            };

        this.onClickEvent = function() { // Launcher onClick event
            if (!PP.isOpen()) {
                this.setUnreadBadgeNum(0);
                this.setLauncherIcon("");
                // clearn message on showing
                messageOnShowing = undefined;
            }
            PP.toggle();
        },

        this.shouldShowLauncherWhenInit = function() { // 是否默认显示小泡
            return !View.$launcher.shouldHideLauncher();
        },

        // Open messageBox and hide Launcher
        this.showMessageBox = function() {
            var $hoverCardController = Ctrl.$hoverCard.get();
            $hoverCardController.asyncPrepareHoverCardInfo( function( prepareSucc ) {

                var mode = Ctrl.$conversationPanel.mode(),
                    lastMode = Ctrl.$conversationQuickMessage.getLastMode();

                if ( mode === Ctrl.$conversationPanel.MODE.QUICK_MESSAGE ) { // We are in QUICK_MESSAGE mode, disable it first
                    Ctrl.$conversationQuickMessage.disable();
                }
                
                var messageOnShowingOld = messageOnShowing;
                View.$launcher.showMessageBox();

                if ( mode === Ctrl.$conversationPanel.MODE.QUICK_MESSAGE ) {
                    
                    if ( Ctrl.$conversationQuickMessage.getActiveConversationId() !== undefined ) {

                        // Simulate we are enter content mode from list mode
                        var activeConversation = Service.$conversationManager.activeConversation,
                            conversationId = activeConversation ? activeConversation.token : undefined;
                        conversationId && Ctrl.$conversationList.showItem( conversationId );
                        return;

                    } else {
                        mode = lastMode;
                        Ctrl.$conversationPanel.mode( mode );
                    }

                }

                if ( mode === Ctrl.$conversationPanel.MODE.CONTENT ) {
                    _enterContentMode();
                } else if ( Ctrl.$conversationPanel.mode() === Ctrl.$conversationPanel.MODE.LIST ) {
                    Ctrl.$conversationList.show();
                }

                function _enterContentMode() {
                    Ctrl.$conversationContent
                        .show( Service.$conversationManager.activeConversation(), { fadeIn: false, delay: 0 }, function() {
                            View.$composerContainer.focus(); // focus
                        } );
                }
                
            } );
        },

        this.onMouseOverEvent = function() {
            _isMouseOver = true;

            if (!this.shouldShowHoverCardOnMouseOver()) {
                return;
            }

            var $hoverCardController = Ctrl.$hoverCard.get();
            $hoverCardController.asyncPrepareHoverCardInfo( function( prepareSucc ) {
                prepareSucc && _showHoverCard();
            } );
        },

        this.onMouseLeaveEvent = function() {
            _isMouseOver = false;
            _hideHoverCard();
        },

        this.isMouseOver = function() {
            return _isMouseOver;
        },

        this.recordOpenConversationItem = function(message) {
            _clickToOpenConversation = message;
        },

        this.getLauncherIcon = function() {
            return _launcherIcon || Service.Constants.ICON_DEFAULT_LAUNCHER;
        },

        this.getLauncherBottomMargin = function() {
            return View.$settings.getLauncherBottomMargin();
        },

        this.getLauncherRightMargin = function() {
            return View.$settings.getLauncherRightMargin();
        },

        this.shouldShowHoverCardOnMouseOver = function() {
            return !Service.$device.isMobileBrowser() && Ctrl.$conversationPanel.mode() === Ctrl.$conversationPanel.MODE.CONTENT;
        },

        this.launcherInit = function() {
        },

        this.setLauncherIcon = function(icon) {
            _launcherIcon = icon;
            $('#pp-launcher-icon').attr('src', this.getLauncherIcon());
        },

        /**
         * 当前小泡是否处于显示状态
         *
         */
        this.isLauncherShow = function() {
            //Note: 不能使用 `$('#pp-launcher-button').hasClass('pp-launcher-button-maximize')` 来判断，因为在一开始`pp-launcher-button`，这两个`class`均没有
            return this.shouldShowLauncherWhenInit() && !$('#pp-launcher-button').hasClass('pp-launcher-button-minimized');
        },

        this.onLauncherInit = function() {
        },

        // unreadNumber <= 0: hidden; unreadNumber>0: show
        this.setUnreadBadgeNum = function(unreadNumber) {
            var show = unreadNumber > 0;
            _unreadBadgeNum = show ? (unreadNumber > 99 ? 99 : unreadNumber) : 0;
            show ? $( '#pp-launcher-badge' ).show() : $( '#pp-launcher-badge' ).hide();
            $('#pp-launcher-badge').text(_unreadBadgeNum);
        },

        this.getUnreadBadgeNum = function() {
            return _unreadBadgeNum;
        },

        this.clear = function() {
            _unreadBadgeNum = 0;
            _launcherIcon = "";
            _clickToOpenConversation = "";
        },

        /**
         * Hide launcher
         */
        this.hideLauncher = function() {
            View.$launcher.hideLauncher();

            this.setUnreadBadgeNum(0);
            this.setLauncherIcon("");

            // clearn message on showing
            messageOnShowing = undefined;
        };

        // on message arrived ...
        Service.$pubsub.subscribe('msgArrived/launcher', function(topics, ppMessage) {
            
            self.setUnreadBadgeNum( self.getUnreadBadgeNum() + 1 );
            self.setLauncherIcon( ppMessage.getBody().user.avatar );
            self.recordOpenConversationItem( ppMessage.getBody() );

            // record the new one
            // so when we click launcher, directyle open chating panel, rather than group list panel
            messageOnShowing = ppMessage.getBody();
            
        });
        
    };

    var _unreadBadgeNum = 0,
        _isMouseOver = false,
        messageOnShowing,

        instance,

        get = function() {
            if (!instance) {
                instance = new PPLauncherCtrl();
            }
            return instance;
        };
    
    return {
        get: get,
    }
    
})();
