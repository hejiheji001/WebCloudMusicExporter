package com.fireaway.h.main;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Created by FireAwayH on 03/09/2016.
 */
public class MusicServlet extends HttpServlet {
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doGet(request, response);
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String method = request.getServletPath().substring(1);
        String value = "";
        if(request.getPathInfo() != null) {
            value = request.getPathInfo().substring(1);
        }else if(request.getQueryString() != null){
            value = request.getQueryString().split("=")[1];
        }
//        request.getRequestDispatcher("/get?" + method + "=" + value).forward(request, response);
        response.sendRedirect("/#/" + method + "?id=" + value);
    }
}
