package com.yjcloud.asr.icp.etc.util;

import android.content.Context;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.util.Log;

import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.util.Enumeration;

public class IPUtil {

    private static final String TAG = "IPUtil";

    /**
     * 获取IP地址
     * @param context
     * @return
     */
    public static String getIPAddress(Context context) {
        NetworkInfo info = ((ConnectivityManager) context
                .getSystemService(Context.CONNECTIVITY_SERVICE)).getActiveNetworkInfo();
        if (info != null && info.isConnected()) {
            if (info.getType() == ConnectivityManager.TYPE_MOBILE) {//当前使用2G/3G/4G网络
                try {
                    for (Enumeration<NetworkInterface> en = NetworkInterface.getNetworkInterfaces(); en.hasMoreElements(); ) {
                        NetworkInterface intf = en.nextElement();
                        for (Enumeration<InetAddress> enumIpAddr = intf.getInetAddresses(); enumIpAddr.hasMoreElements(); ) {
                            InetAddress inetAddress = enumIpAddr.nextElement();
                            if (!inetAddress.isLoopbackAddress() && inetAddress instanceof Inet4Address) {
                                return inetAddress.getHostAddress();
                            }
                        }
                    }
                } catch (SocketException e) {
                    Log.e(TAG, "获取2G/3G/4G网络的IP出错", e);
                }
            } else if (info.getType() == ConnectivityManager.TYPE_WIFI) {//当前使用无线网络
                WifiManager wifiManager = (WifiManager) context.getSystemService(Context.WIFI_SERVICE);
                WifiInfo wifiInfo = wifiManager.getConnectionInfo();
                //调用方法将int转换为地址字符串
                String ipAddress = intIP2StringIP(wifiInfo.getIpAddress());//得到IPV4地址
                return ipAddress;
            }else{// 获取有线网络
                try {
                    Enumeration<NetworkInterface> enumerationNi  = NetworkInterface.getNetworkInterfaces();
                    while (enumerationNi.hasMoreElements()) {
                        NetworkInterface networkInterface = enumerationNi.nextElement();
                        String interfaceName = networkInterface.getDisplayName();
                        Log.i("tag", "网络名字" + interfaceName);
                        if (interfaceName.equals("eth0")) {
                            Enumeration<InetAddress> enumIpAddr = networkInterface.getInetAddresses();
                            while (enumIpAddr.hasMoreElements()) {
                                InetAddress inetAddress = enumIpAddr.nextElement();
                                if (!inetAddress.isLoopbackAddress() && inetAddress instanceof Inet4Address) {
                                    Log.i("tag", inetAddress.getHostAddress() + " ");
                                    return inetAddress.getHostAddress();
                                }
                            }
                        }
                    }
                } catch (SocketException e) {
                    Log.e(TAG, "获取有线的IP出错", e);
                }
            }
        } else {
            Log.e(TAG, "当前无网络连接,请在设置中打开网络");
        }
        return null;
    }


    /**
     * 将得到的int类型的IP转换为String类型
     * @param ip
     * @return
     */
    private static String intIP2StringIP(int ip) {
        return (ip & 0xFF) + "." +
                ((ip >> 8) & 0xFF) + "." +
                ((ip >> 16) & 0xFF) + "." +
                (ip >> 24 & 0xFF);
    }

}
