#ifndef WEBWIDGET_H
#define WEBWIDGET_H

//Qt 5.0 won't minimize frameless windows. TODO: Remove when fixed
// https://bugreports.qt-project.org/browse/QTBUG-29109
#define MINIMIZE_PATCH

#include <QDebug>
#include <QCursor>
#include <QtWebKit>
#include <QWebView>
#include <QtWidgets>
#include <QWebFrame>
#include <QWebSettings>
#include <QWebInspector>
#include <QtWebKitWidgets>

#include <webgraphicsview.h>

class WebWidget : public QMainWindow
{
    Q_OBJECT

    public:
        WebWidget(QApplication *app);

        Q_INVOKABLE void quit();
        Q_INVOKABLE void minimize();
        Q_INVOKABLE void maximize();
        Q_INVOKABLE void showTrayIcon();
        Q_INVOKABLE void hideTrayIcon();
        Q_INVOKABLE void removeTrayIcon();
        Q_INVOKABLE void removeTrayIconMenuItems();
        Q_INVOKABLE void createTrayIcon(QString icon);
        Q_INVOKABLE void setTrayIconTitle(QString title);
        Q_INVOKABLE void removeTrayIconMenuItem(QString id);
        Q_INVOKABLE void resize(int x, int y, int w, int h);
        Q_INVOKABLE void mouseMoveEvent(int dragX, int dragY);
        Q_INVOKABLE void mousePressEvent(int fromBorderX, int fromBorderY);
        Q_INVOKABLE void addTrayIconMenuItem(QString id, QString text, QString event);
        Q_INVOKABLE void showTrayIconMessage(QString title, QString msg, QString icon = "NoIcon", int msecs = 10000);

    private:

        typedef enum {
            MainWindow = 0,
            DebugWindow = 1
        } WindowType;

        QWidget *widget; //Main widget where the webView is placed
        QApplication *app;
        QVBoxLayout *layout; //Layout of main widget
        WebGraphicsView *gv;
        QMenu *trayIconMenu;
        QDesktopWidget *desktop;
        QPoint fromBorderPosition;
        QSystemTrayIcon *trayIcon = 0;
#ifndef QT_NO_DEBUG
        QWebInspector *webInspector;
#endif

        QRect getCustomGeometry(WindowType wt);

    private slots:
        void cleanUp();
        void createJSBridge();
        void trayIconMenuClicked(QAction *action);
        void trayIconClicked(QSystemTrayIcon::ActivationReason reason);
};

#endif // WEBWIDGET_H
