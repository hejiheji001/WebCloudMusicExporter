package com.fireaway.h.main;

/**
 * By FireAwayH on 15/03/2016.
 */
import javax.servlet.*;
import java.io.IOException;

public class SetCharacterEncoding implements Filter {
    @Override
    public void destroy() {
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response,
        FilterChain chain) throws IOException, ServletException {

        request.setCharacterEncoding("UTF-8");
        chain.doFilter(request, response);
    }

    @Override
    public void init(FilterConfig arg0) throws ServletException {
    }
}