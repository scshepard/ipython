// Copyright (c) IPython Development Team.
// Distributed under the terms of the Modified BSD License.

require([
    'base/js/namespace',
    'jquery',
    'notebook/js/notebook',
    'base/js/utils',
    'base/js/page',
    'notebook/js/layoutmanager',
    'base/js/events',
    'auth/js/loginwidget',
    'notebook/js/maintoolbar',
    'notebook/js/pager',
    'notebook/js/quickhelp',
    'notebook/js/menubar',
    'notebook/js/notificationarea',
    'notebook/js/savewidget',
    'notebook/js/keyboardmanager',
    'notebook/js/config',
    'notebook/js/kernelselector',
    'codemirror/lib/codemirror',
    // only loaded, not used, please keep sure this is loaded last
    'custom/custom'
], function(
    IPython, 
    $,
    notebook, 
    utils, 
    page, 
    layoutmanager, 
    events,
    loginwidget, 
    maintoolbar, 
    pager, 
    quickhelp, 
    menubar, 
    notificationarea, 
    savewidget, 
    keyboardmanager,
    config,
    kernelselector,
    CodeMirror,
    // please keep sure that even if not used, this is loaded last
    custom
    ) {
    "use strict";

    // compat with old IPython, remove for IPython > 3.0
    window.CodeMirror = CodeMirror;

    var common_options = {
        ws_url : utils.get_body_data("wsUrl"),
        base_url : utils.get_body_data("baseUrl"),
        notebook_path : utils.get_body_data("notebookPath"),
        notebook_name : utils.get_body_data('notebookName')
    };

    var user_config = $.extend({}, config.default_config);
    var page = new page.Page();
    var layout_manager = new layoutmanager.LayoutManager();
    var pager = new pager.Pager('div#pager', 'div#pager_splitter', {
        layout_manager: layout_manager, 
        events: events});
    var keyboard_manager = new keyboardmanager.KeyboardManager({
        pager: pager, 
        events: events});
    var save_widget = new savewidget.SaveWidget('span#save_widget', {
        events: events, 
        keyboard_manager: keyboard_manager});
    var notebook = new notebook.Notebook('div#notebook', $.extend({
        events: events,
        keyboard_manager: keyboard_manager,
        save_widget: save_widget,
        config: user_config},
        common_options));
    var login_widget = new loginwidget.LoginWidget('span#login_widget', common_options);
    var toolbar = new maintoolbar.MainToolBar('#maintoolbar-container', {
        notebook: notebook, 
        events: events}); 
    var quick_help = new quickhelp.QuickHelp({
        keyboard_manager: keyboard_manager, 
        events: events,
        notebook: notebook});
    var menubar = new menubar.MenuBar('#menubar', $.extend({
        notebook: notebook, 
        layout_manager: layout_manager, 
        events: events, 
        save_widget: save_widget, 
        quick_help: quick_help}, 
        common_options));
    var notification_area = new notificationarea.NotificationArea(
        '#notification_area', {
        events: events, 
        save_widget: save_widget, 
        notebook: notebook,
        keyboard_manager: keyboard_manager});
    notification_area.init_notification_widgets();
    var kernel_selector = new kernelselector.KernelSelector(
        '#kernel_selector_widget', notebook);

    $('body').append('<div id="fonttest"><pre><span id="test1">x</span>'+
                     '<span id="test2" style="font-weight: bold;">x</span>'+
                     '<span id="test3" style="font-style: italic;">x</span></pre></div>');
    var nh = $('#test1').innerHeight();
    var bh = $('#test2').innerHeight();
    var ih = $('#test3').innerHeight();
    if(nh != bh || nh != ih) {
        $('head').append('<style>.CodeMirror span { vertical-align: bottom; }</style>');
    }
    $('#fonttest').remove();

    page.show();

    layout_manager.do_resize();
    var first_load = function () {
        layout_manager.do_resize();
        var hash = document.location.hash;
        if (hash) {
            document.location.hash = '';
            document.location.hash = hash;
        }
        notebook.set_autosave_interval(notebook.minimum_autosave_interval);
        // only do this once
        events.off('notebook_loaded.Notebook', first_load);
    };
    events.on('notebook_loaded.Notebook', first_load);
    
    IPython.page = page;
    IPython.layout_manager = layout_manager;
    IPython.notebook = notebook;
    IPython.pager = pager;
    IPython.quick_help = quick_help;
    IPython.login_widget = login_widget;
    IPython.menubar = menubar;
    IPython.toolbar = toolbar;
    IPython.notification_area = notification_area;
    IPython.keyboard_manager = keyboard_manager;
    IPython.save_widget = save_widget;
    IPython.config = user_config;
    IPython.tooltip = notebook.tooltip;

    events.trigger('app_initialized.NotebookApp');
    notebook.load_notebook(common_options.notebook_name, common_options.notebook_path);

});
