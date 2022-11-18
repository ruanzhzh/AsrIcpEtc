
package com.yjcloud.asr.icp.etc;

import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.ValueCallback;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.appcompat.app.AppCompatActivity;

import com.yjcloud.asr.icp.etc.update.AppAutoUpdateActivity;
import com.yjcloud.asr.icp.etc.update.GetUpdateInfo;
import com.yjcloud.asr.icp.etc.update.PermisionUtils;
import com.yjcloud.asr.icp.etc.util.IPUtil;

import org.json.JSONObject;

public class MainActivity extends AppCompatActivity {

    private static final String TAG = "Main";

    private WebView webview;

    // 服务端基础地址
    private String baseUrl;

    private Integer newVerCode;

    // 更新内容
    private String updateInfo;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        PermisionUtils.verifyStoragePermissions(this);

        Window window = getWindow();
        //隐藏标题栏
        requestWindowFeature(Window.FEATURE_NO_TITLE);//隐藏状态栏
        //定义全屏参数
        int flag=WindowManager.LayoutParams.FLAG_FULLSCREEN;
        //设置当前窗体为全屏显示
        window.setFlags(flag, flag);

        // 实例化WebView对象
        webview = new WebView(this);
        // 设置WebView属性，能够执行Javascript脚本
        webview.getSettings().setJavaScriptEnabled(true);
        // 打开本地缓存提供JS调用,至关重要
        webview.getSettings().setDomStorageEnabled(true);

        webview.getSettings().setAllowFileAccessFromFileURLs(true);
        webview.getSettings().setAllowUniversalAccessFromFileURLs(true);

        webview.getSettings().setAllowFileAccess(true);
        webview.getSettings().setAllowContentAccess(true);

        String appCachePath = getApplication().getCacheDir().getAbsolutePath();
        webview.getSettings().setAppCachePath(appCachePath);
        webview.getSettings().setDatabaseEnabled(true);

        // 自适应屏幕
        //webview.getSettings().setUseWideViewPort(true);
        //webview.getSettings().setLoadWithOverviewMode(true);

        webview.setWebViewClient(new MyWebViewClient());
        webview.loadUrl("file:///android_asset/index.html"); //显示本地网页

        //设置Web视图
        setContentView(webview);
    }


    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if((keyCode == KeyEvent.KEYCODE_BACK) && webview.canGoBack() ){
            webview.goBack();
            return  true;
        }
        return  false;
    }


    private class MyWebViewClient extends WebViewClient {
        // 在WebView中而不是默认浏览器中显示页面
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            view.loadUrl(url);
            return true;
        }

        /**
         * 获取localStorage存储的服务端地址
         * @param view
         * @param url
         */
        @Override
        public void onPageFinished(WebView view, String url) {
            super.onPageFinished(view, url);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                String baseUrlJS = "window.localStorage.getItem('baseUrl');";
                view.evaluateJavascript(baseUrlJS, new ValueCallback(){
                    @Override
                    public void onReceiveValue(Object value) {
                        String url = value.toString();
                        if(url != null && url.trim().length() > 0){
                            url = url.replaceAll("\"","");
                            if(!"null".equalsIgnoreCase(url)){
                                baseUrl = url;
                                new Thread(){
                                    public void run(){
                                        try{
                                            if(getServerVersion()){
                                                PackageInfo info = getPackageManager().getPackageInfo(getPackageName(), 0);
                                                if(newVerCode > info.versionCode){
                                                    Intent intent = new Intent();
                                                    intent.setClass(MainActivity.this, AppAutoUpdateActivity.class);
                                                    intent.putExtra("baseUrl", baseUrl);
                                                    intent.putExtra("updateInfo", updateInfo);
                                                    startActivity(intent);
                                                }
                                            }
                                        }catch (PackageManager.NameNotFoundException e){
                                            Log.e(TAG, "检查是否需要更新失败", e);
                                        }
                                    }
                                }.start();
                            }
                        }
                    }
                });
                // 设备IP
                String devIp = IPUtil.getIPAddress(MainActivity.this);
                String ipJS = "window.localStorage.setItem('devIp','"+ devIp +"');";
                view.evaluateJavascript(ipJS, new ValueCallback(){
                    @Override
                    public void onReceiveValue(Object value) {
                        Log.i(TAG, "IP:"+ devIp +", 设置结果:" + value);
                    }
                });

            }
        }
    }

    /**
     * 获取服务端版本信息
     * @return
     */
    private boolean getServerVersion(){
        try{
            String versionUrl = baseUrl + "/etc/version.json";
            String newVerJSON = GetUpdateInfo.getUpateVerJSON(versionUrl);
            JSONObject jsonObject = new JSONObject(newVerJSON);
            newVerCode = Integer.parseInt(jsonObject.getString("verCode"));
            updateInfo = "修复Bug";
            if(jsonObject.has("updateInfo")){
                updateInfo = jsonObject.getString("updateInfo");
            }
        }catch (Exception e){
            Log.e(TAG, "获取服务端版本信息失败", e);
            return false;
        }
        return true;
    }



}