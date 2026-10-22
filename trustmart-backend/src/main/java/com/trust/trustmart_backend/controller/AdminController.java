
package com.trust.trustmart_backend.controller;

import com.trust.trustmart_backend.User;
import com.trust.trustmart_backend.UserRepository;
import com.trust.trustmart_backend.product.Product;
import com.trust.trustmart_backend.product.ProductRepository;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public AdminController(
            UserRepository userRepository,
            ProductRepository productRepository) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    @GetMapping("/stats")
    public Map<String, Long> getStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalProducts", productRepository.count());
        return stats;
    }

    @GetMapping("/users")
    public List<Map<String, Object>> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(user -> {
                    Map<String, Object> result = new HashMap<>();
                    result.put("id", user.getId());
                    result.put("name", user.getName());
                    result.put("email", user.getEmail());
                    result.put("role", user.getRole().name());
                    return result;
                })
                .toList();
    }

    @GetMapping("/products")
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @DeleteMapping("/products/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(@PathVariable Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Product not found"
            );
        }

        productRepository.deleteById(id);
    }
}
